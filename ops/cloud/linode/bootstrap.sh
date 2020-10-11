#!/bin/bash
set -eo pipefail

# Required env vars: LETSENCRYPT_EMAIL, CLOUDFLARE_EMAIL, CLOUDFLARE_API_KEY, CLOUDFLARE_ACCOUNT_ID
set -o allexport; source <(sops --decrypt .enc.env); source <(sops --decrypt ../cloudflare/.enc.env); set +o allexport

# Get and apply kubeconfig
terraform output kubeconfig | base64 -d > kubeconfig
KUBECONFIG=$(pwd)/kubeconfig:$HOME/.kube/config kubectl config view --raw > ~/.kube/config
rm kubeconfig

# Install ingress nginx controller for ingress
echo "Installing ingress-nginx"
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
kubectl create ns ingress-nginx &> /dev/null || true
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx --wait --set controller.publishService.enabled=true --namespace ingress-nginx

# # Install Cert Manager for Let's Encrypt certs
echo "Installing cert manager"
cd cert-manager
kubectl create ns cert-manager &> /dev/null || true
helm repo add jetstack https://charts.jetstack.io
helm upgrade --install cert-manager jetstack/cert-manager --version v0.15.1 --namespace cert-manager --set installCRDs=true
sops -d secrets.enc.yaml | kubectl apply -f -
cd ..

# Install Linode block storage driver
echo "Installing Linode block storage driver"
kubectl apply -f https://raw.githubusercontent.com/linode/linode-blockstorage-csi-driver/master/pkg/linode-bs/deploy/releases/linode-blockstorage-csi-driver-v0.1.6.yaml

# Create a dummy deploy to create an ingress and get an external IP
echo "Installing dummy helloworld service to acquire IP"
cd helloworld
kubectl create ns helloworld &> /dev/null || true
kubectl -n helloworld create deployment web --image=gcr.io/google-samples/hello-app:1.0  &> /dev/null || true
kubectl -n helloworld expose deployment web --type=NodePort --port=8080 &> /dev/null || true
kubectl apply -f ingress.yaml
bash -c 'external_ip=""; while [ -z $external_ip ]; do echo "Waiting for end point..."; external_ip=$(kubectl -n helloworld get ing example-ingress --template="{{range .status.loadBalancer.ingress}}{{.ip}}{{end}}"); [ -z "$external_ip" ] && sleep 2; done; echo "End point ready-" && echo $external_ip;'
cd ../../cloudflare
terraform plan -var=ingress-ip=$(kubectl -n helloworld get ing example-ingress --template="{{range .status.loadBalancer.ingress}}{{.ip}}{{end}}") --out plan
terraform apply plan
cd ../linode

# Create the private docker registry
echo "Installing docker registry"
cd docker-registry
kubectl create ns docker-registry &> /dev/null || true
sops -d secrets.enc.yaml | kubectl apply -f -
helm repo add stable https://kubernetes-charts.storage.googleapis.com
helm upgrade --install docker-registry stable/docker-registry --values values.yaml --namespace docker-registry \
  --set secrets.htpasswd=$(kubectl -n docker-registry get secret/docker-registry-secret-prime -o json | jq -r .data.htpasswd | base64 -d | tr -d '\n') \
  --set secrets.haSharedSecret=$(kubectl -n docker-registry get secret/docker-registry-secret-prime -o json | jq -r .data.haSharedSecret | base64 -d | tr -d '\n')
kubectl create ns catarse &> /dev/null || true
kubectl -n catarse delete secret docker-registry regcred &> /dev/null || true
kubectl -n catarse create secret docker-registry regcred \
  --docker-server=docker.bundlepledge.com --docker-username=root \
  --docker-password=$(kubectl -n docker-registry get secret/docker-registry-secret-prime -o json | jq -r .data.password | base64 -d | tr -d '\n') \
  --docker-email=null@example.com
cd ..

# Put at the end because of needing to wait for some cert-manager stuff to be ready...
envsubst '$$LETSENCRYPT_EMAIL $$CLOUDFLARE_EMAIL' < cert-manager/ClusterIssuer.yaml | kubectl apply -f -
