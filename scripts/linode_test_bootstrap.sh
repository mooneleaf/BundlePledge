#!/bin/bash
set -e
set -x

# Build catarse.js
cd services/catarse.js
yarn
yarn build
# Copy the catarse.js dist to RoR Catarase apps assets
cp dist/* ../catarse/app/assets/javascripts/api/
cd ../..
skaffold run -p linode-test-db-init
kubectl -n catarse rollout status -w deploy/service-core-db
kubectl -n catarse rollout status -w deploy/catarse-db
skaffold run -p linode-test-migrations
kubectl -n catarse wait --for=condition=complete job/migrations --timeout=60s
skaffold run -p linode-test-prime
kubectl -n catarse wait --for=condition=complete job/db-prime --timeout=60s
skaffold run -p linode-test-setup
kubectl -n catarse wait --for=condition=complete job/fdw-settings --timeout=60s
kubectl -n catarse wait --for=condition=complete job/demo-settings --timeout=60s
kubectl -n catarse delete job/catarse-migrations
skaffold run -p linode-test-migrations
kubectl -n catarse wait --for=condition=complete job/catarse-migrations --timeout=60s
skaffold run -p linode-test-db
skaffold run -p linode-test-run