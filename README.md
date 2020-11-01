### under development

# services core [![CircleCI](https://circleci.com/gh/common-group/services-core.svg?style=svg)](https://circleci.com/gh/common-group/services-core)
This repo contains docker files to setup the Catarse environment. All dependendent repos are included as git subtrees mounted on the ```services``` folder.

## setup
For every service described on `docker-compose.yml` we have multiple env_files `compose_env/.*.env.sample`. Just make a copy off all of them on the same directory removing .sample.

Start Database:
`$ docker-compose up -d service_core_db`

Run the migrations and seed database with sample data:
```
$ docker-compose up migrations
// database service mapping the 5444 to postgres container
$ psql -h localhost -p 5444 -U postgres service_core < services/service-core-db/sample.seed.sql
```

Start services:
`$ docker-compose up -d`

Run migrations of catarse
```
$ docker-compose exec catarse rake db:migrate # will have an error here after some migrations running.
$ docker-compose exec catarse rake dev_seed:demo_settings # insert host data to configure common_db forward schema
$ docker-compose exec catarse rake common:generate_fdw # generate forward schemas using config from previous command
$ docker-compose exec catarse rake db:migrate # run again and should finish migrations
```

# Local KinD/MicroK8s cluster

## KinD

### Prereqs

 - Docker https://docs.docker.com/get-docker/
 - KinD https://kind.sigs.k8s.io/

KinD stand for Kubernetes in Docker and is the easiest way to get started. Every cluster created in KinD is ephemeral. Rebooting of your machine will break the cluster and require it to be re-created. The scripts/local_kind_bootstrap.sh script will spin up a cluster.

## MicroK8s

Setting up catarse on a MicroK8s cluster is possible as well. The cluster will stick around and is re-usable across system restarts. However there is more work involved to get setup.

The following add-ons must be installed:
 - `microk8s.enable dns`
 - `microk8s.enable storage`
 - `microk8s.enable ingress`
 - `microk8s.enable registry:size=40Gi`

If necessary, edit the node annoations to add ingress.

Follow the instructions here https://microk8s.io/docs/registry-built-in to activate the internal registry

Use the scripts/local_mircok8s_bootstrap.sh script

## Catarse.js frontend

When run in local development mode, the catarse.js webpack server needs to be started locally.

In a separate terminal:

```
cd services/catarse.js
yarn
yarn build:dev
```

# Provisioning

You will need the following tools installed:
 - kubectl
 - terraform
 - helm 3.x
 - AWS CLI w/ default credentials configured for the account you want to deploy to

## Bootstrap terraform

(This only ever needs to be done once) Inside `/ops/tools/bootstrap` run the following commands:

```
terraform init
terraform plan --out plan
terraform apply plan
```

## Start Linode k8s

Inside `/ops/cloud/linode` run the following commands:

```
./plan.sh
# if everything looks good.... (all green text, no red text)
./apply.sh
```

Once finished, install k8s dependencies and connect cloudflare DNS:

```
./bootstrap.sh
```

Cluster is now ready to install catarse

Go back to root of repo:

```
cd ../..
```

Run catarse install script:

```
./scripts/linode_test_bootstrap.sh
```

To delete everything from Linode, go to `ops/cloud/linode` and run:

```
./destroy.sh
```

Confirm that you want want to delete the cluster.

## Start AWS k8s (deprecated because of cost)

Inside `/ops/cloud/aws/eksctl` run the following commands:

```
./build.sh
```

This will take some time. After it is done you can check if you can connect to the cluster:

```
kubectl cluster-info
```

To login, you'll need a token. Generate one:

```
kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep service-controller-token | awk '{print $1}')
```

To log into the dashboard, you need to create a local proxy:

```
kubectl proxy
```

While the proxy is running, visist http://127.0.0.1:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/ and enter the token retrieved earlier.
