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

## Skaffold notes

Start with running the base profile:
```
skaffold run -p local-run
skaffold run -p local-db-init
```

Start the migration job:
```
skaffold run -p local-migrations
```

Now seed the DB:
```
skaffold run -p local-prime
```

Next load default/demo settings
```
skaffold run -p local-setup
```

Wait for migrations job to re-run and be succesful. To check the status of the migration run 
```
kubectl logs job/catarse-migrations
```. 

Run catarse:
```
skaffold dev -p local-catarse --port-forward
```

Catarse is now running at http://localhost:3000

# Provisioning

You will need the following tools installed:
 - kubectl
 - terraform
 - AWS CLI w/ default credentials configured for the account you want to deploy to


(This only ever needs to be done once) Inside `/infrastructure/terraform/bootstrap` run the following commands:

```
terraform init
terraform plan --out plan
terraform apply plan
```


Inside `/infrastructure/terraform/ecr` run the following commands:

```
terraform init
terraform plan --out plan
terraform apply plan
```

Inside `/infrastructure/eksctl` run the following commands:

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

