#!/bin/bash

# Install ingress nginx controller for ingress
# echo "Installing ingress-nginx"
# helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
# kubectl create ns ingress-nginx
# helm install ingress-nginx ingress-nginx/ingress-nginx --set controller.publishService.enabled=true --namespace ingress-nginx
# kubectl wait --namespace ingress-nginx --for=condition=ready pod --selector=app.kubernetes.io/component=controller   --timeout=120s

# # Install Cert Manager for Let's Encrypt certs
# echo "Installing cert manager"
# kubectl create ns cert-manager
# helm repo add jetstack https://charts.jetstack.io
# helm install cert-manager jetstack/cert-manager --version v0.15.1 --namespace cert-manager

# # Install Linode block storage driver
# echo "Installing Linode block storage driver"
# kubectl apply -f https://raw.githubusercontent.com/linode/linode-blockstorage-csi-driver/master/pkg/linode-bs/deploy/releases/linode-blockstorage-csi-driver-v0.1.6.yaml

# Not good enough because this token expires
# CREDENTIALS=$(aws sts get-session-token)
# AWS_ACCESS_KEY_ID=$(echo $CREDENTIALS | jq -r .Credentials.AccessKeyId)
# AWS_SECRET_ACCESS_KEY=$(echo $CREDENTIALS | jq -r .Credentials.SecretAccessKey)

kubectl delete secret --ignore-not-found aws
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Secret
metadata:
  name: aws
  namespace: aws-ecr
data:
  AWS_SECRET_ACCESS_KEY: $(echo $AWS_SECRET_ACCESS_KEY | base64 -w 0)
  AWS_ACCESS_KEY_ID: $(echo $AWS_ACCESS_KEY_ID | base64 -w 0)
EOF
#kubectl apply -f ecr-token-cron.yaml
