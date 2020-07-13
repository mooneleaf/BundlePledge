#!/bin/bash
set -x

cat <<EOF | kind create cluster --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
EOF
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/master/deploy/static/provider/kind/deploy.yaml
skaffold run -p local-db-init
kubectl rollout status -w deploy/service-core-db
kubectl rollout status -w deploy/catarse-db
skaffold run -p local-migrations
kubectl wait --for=condition=complete job/migrations
skaffold run -p local-prime
kubectl wait --for=condition=complete job/db-prime
skaffold run -p local-setup
kubectl wait --for=condition=complete job/fdw-settings
kubectl wait --for=condition=complete job/demo-settings
kubectl delete job/catarse-migrations
skaffold run -p local-migrations
kubectl wait --for=condition=complete job/catarse-migrations
skaffold run -p local-db
skaffold run -p local-run --status-check=false
skaffold run -p local-catarse