output  "kubeconfig" {
  value       = linode_lke_cluster.test-catarse-cluster.kubeconfig
  sensitive   = true
  description = "kubeconfig to access cluster"
}

