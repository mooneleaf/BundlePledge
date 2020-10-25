#!/bin/bash
set -eo pipefail
set -o allexport; source <(sops --decrypt .enc.env); set +o allexport

cd ../../../
skaffold delete -p linode-test-db-init
skaffold delete -p linode-test-run
cd ops/cloud/linode

terraform destroy
