#!/bin/bash
set -eo pipefail

sops --decrypt .enc.env > .env
set -o allexport; source .env; set +o allexport

cleanup () {
  rm -f ".env" &> /dev/null
  exit $exit_code
}
trap cleanup EXIT ERR INT TERM

terraform destroy
