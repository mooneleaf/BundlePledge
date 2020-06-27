#!/bin/bash
set -x

# Build catarse.js
cd services/catarse.js
yarn
yarn build
# Copy the catarse.js dist to RoR Catarase apps assets
cp dist/* ../catarse/app/assets/javascripts/api/
cd ../..
skaffold run -p test-db-init
kubectl rollout status -w deploy/service-core-db
kubectl rollout status -w deploy/catarse-db
skaffold run -p test-migrations
kubectl wait --for=condition=complete job/migrations
skaffold run -p test-prime
kubectl wait --for=condition=complete job/db-prime
skaffold run -p test-setup
kubectl wait --for=condition=complete job/fdw-settings
kubectl wait --for=condition=complete job/demo-settings
kubectl delete job/catarse-migrations
skaffold run -p test-migrations
kubectl wait --for=condition=complete job/catarse-migrations
skaffold run -p test-db
skaffold run -p test-run