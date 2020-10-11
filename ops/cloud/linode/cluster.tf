resource "linode_lke_cluster" "test-catarse-cluster" {
    label       = "catarse-cluster"
    k8s_version = "1.17"
    region      = "us-central"
    tags        = ["test"]

    pool {
        type  = "g6-standard-2"
        count = 2
    }
}