#!/bin/sh

CLUSTER_NAME=$1
REGION=${2-us-east-1}

# Create cluster
cat <<EOF | eksctl create cluster -f -
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig
metadata:
  name: ${CLUSTER_NAME}
  region: ${REGION}
nodeGroups:
  - name: ng-1
    instanceType: t3.large
    desiredCapacity: 2
    ssh:
      allow: true
    iam:
      withAddonPolicies:
        autoScaler: true
        certManager: true
        ebs: true
        albIngress: true
EOF

# Install Metrics 
wget -O v0.3.6.tar.gz https://codeload.github.com/kubernetes-sigs/metrics-server/tar.gz/v0.3.6 && tar -xzf v0.3.6.tar.gz
kubectl apply -f metrics-server-0.3.6/deploy/1.8+/
rm -rf metrics-server-0.3.6
rm v0.3.6.tar.gz

# Create OpenID provider for authentication w/ ALB
eksctl utils associate-iam-oidc-provider \
    --region ${REGION} \
    --cluster ${CLUSTER_NAME} \
    --approve

# ALB controller RBAC
kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/aws-alb-ingress-controller/v1.1.4/docs/examples/rbac-role.yaml

# Service account for ALB controller
eksctl create iamserviceaccount \
    --region ${REGION} \
    --name alb-ingress-controller \
    --namespace kube-system \
    --cluster ${CLUSTER_NAME} \
    --attach-policy-arn arn:aws:iam::892910702142:policy/ALBIngressControllerIAMPolicy \
    --override-existing-serviceaccounts \
    --approve

# ALB Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/aws-alb-ingress-controller/v1.1.4/docs/examples/alb-ingress-controller.yaml

# Patch ALB Controller
kubectl patch deployment.apps/alb-ingress-controller -n kube-system --type json -p '[{ "op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--cluster-name=${CLUSTER_NAME}" }]'

# EBS Controller
kubectl apply -k "github.com/kubernetes-sigs/aws-ebs-csi-driver/deploy/kubernetes/overlays/stable/?ref=master"

# Add github actions as authorized user
eksctl create iamidentitymapping --cluster ${CLUSTER_NAME} --arn arn:aws:iam::892910702142:user/catarse-github-action --group system:masters --username github-actions