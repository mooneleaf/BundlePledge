#!/bin/bash
set -x
echo "Make sure your MicroK8s has dns, storage and ingress enabled"
export SKAFFOLD_INSECURE_REGISTRY='127.0.0.1:32000'
skaffold run -p local-db-init --default-repo 127.0.0.1:32000
kubectl rollout status -w deploy/service-core-db
kubectl rollout status -w deploy/catarse-db
skaffold run -p local-migrations --default-repo 127.0.0.1:32000
kubectl wait --for=condition=complete job/migrations
skaffold run -p local-prime --default-repo 127.0.0.1:32000
kubectl wait --for=condition=complete job/db-prime
skaffold run -p local-setup --default-repo 127.0.0.1:32000
kubectl wait --for=condition=complete job/fdw-settings
kubectl wait --for=condition=complete job/demo-settings
kubectl delete job/catarse-migrations
skaffold run -p local-migrations --default-repo 127.0.0.1:32000
kubectl wait --for=condition=complete job/catarse-migrations
skaffold run -p local-db --default-repo 127.0.0.1:32000
skaffold run -p local-run --status-check=false --default-repo 127.0.0.1:32000
skaffold run -p local-catarse --default-repo 127.0.0.1:32000
