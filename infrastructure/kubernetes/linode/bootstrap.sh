#!/bin/bash
set -e

# Required env vars: LETSENCRYPT_EMAIL, CLOUDFLARE_EMAIL, CLOUDFLARE_API_KEY, CLOUDFLARE_ACCOUNT_ID

# Get and apply kubeconfig
terraform output kubeconfig | base64 -d > kubeconfig
KUBECONFIG=$(pwd)/kubeconfig:$HOME/.kube/config kubectl config view --raw > ~/.kube/config
rm kubeconfig

# Install ingress nginx controller for ingress
echo "Installing ingress-nginx"
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
kubectl create ns ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx --set controller.publishService.enabled=true --namespace ingress-nginx
kubectl wait --namespace ingress-nginx --for=condition=ready pod --selector=app.kubernetes.io/component=controller   --timeout=120s

# # Install Cert Manager for Let's Encrypt certs
echo "Installing cert manager"
cd cert-manager
kubectl create ns cert-manager
helm repo add jetstack https://charts.jetstack.io
helm install cert-manager jetstack/cert-manager --version v0.15.1 --namespace cert-manager --set installCRDs=true
sops -d secrets.enc.yaml | kubectl apply -f -

# # Install Linode block storage driver
echo "Installing Linode block storage driver"
kubectl apply -f https://raw.githubusercontent.com/linode/linode-blockstorage-csi-driver/master/pkg/linode-bs/deploy/releases/linode-blockstorage-csi-driver-v0.1.6.yaml

# Create a dummy deploy to create an ingress and get an external IP
cd helloworld
kubectl create ns helloworld
kubectl -n helloworld create deployment web --image=gcr.io/google-samples/hello-app:1.0
kubectl -n helloworld expose deployment web --type=NodePort --port=8080
kubectl apply -f ingress.yaml
kubectl -n helloworld get ing/example-ingress -o json | jq .status.loadBalancer.ingress[0].ip
cd ../../../cloudflare
terraform plan -var=ingress-ip=$(kubectl -n helloworld get ing/example-ingress -o json | jq -r .status.loadBalancer.ingress[0].ip) --out plan
terraform apply plan
cd ../kubernetes/linode

# Create the private docker registry
cd docker-registry
kubectl create ns docker-registry
sops -d secrets.enc.yaml | kubectl apply -f -
helm repo add stable https://kubernetes-charts.storage.googleapis.com
helm install docker-registry stable/docker-registry --values values.yaml --namespace docker-registry \
  --set secrets.htpasswd=$(kubectl -n docker-registry get secret/docker-registry-secret-prime -o json | jq -r .data.htpasswd | base64 -d | tr -d '\n') \
  --set secrets.haSharedSecret=$(kubectl -n docker-registry get secret/docker-registry-secret-prime -o json | jq -r .data.haSharedSecret | base64 -d | tr -d '\n')
kubectl -n catarse create secret docker-registry regcred \
  --docker-server=docker.bundlepledge.com --docker-username=root \
  --docker-password=$(kubectl -n docker-registry get secret/docker-registry-secret-prime -o json | jq -r .data.password | base64 -d | tr -d '\n') \
  --docker-email=null@example.com
cd ..


# Not good enough because this token expires
# CREDENTIALS=$(aws sts get-session-token)
# AWS_ACCESS_KEY_ID=$(echo $CREDENTIALS | jq -r .Credentials.AccessKeyId)
# AWS_SECRET_ACCESS_KEY=$(echo $CREDENTIALS | jq -r .Credentials.SecretAccessKey)

# kubectl delete secret --ignore-not-found aws
# cat <<EOF | kubectl apply -f -
# apiVersion: v1
# kind: Secret
# metadata:
#   name: aws
#   namespace: aws-ecr
# data:
#   AWS_SECRET_ACCESS_KEY: $(echo $AWS_SECRET_ACCESS_KEY | base64 -w 0)
#   AWS_ACCESS_KEY_ID: $(echo $AWS_ACCESS_KEY_ID | base64 -w 0)
# EOF
#kubectl apply -f ecr-token-cron.yaml
