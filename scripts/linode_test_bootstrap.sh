#!/bin/bash
set -e
set -x


sops -d infrastructure/kustomize/overlays/test-db/secrets.enc.yaml > infrastructure/kustomize/overlays/test-db/secrets.yaml
sops -d services/service-core-db/setup_fdw_grants.sql.enc > services/service-core-db/setup_fdw_grants.sql
dbpasswd=$(yq r infrastructure/kustomize/overlays/test-db/secrets.yaml data.DB_PASSWORD | base64 -d | tr -d '\n')
export POSTGREST_USER_PASSWORD=$dbpasswd
export PROXY_USER_PASSWORD=$dbpasswd
export CATARSE_FDW_USER_PASSWORD=$dbpasswd

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