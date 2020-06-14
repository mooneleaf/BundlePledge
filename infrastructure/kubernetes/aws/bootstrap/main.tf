terraform {
  backend "s3" {
    bucket         = "catarse-terraform-up-and-running-state"
    key            = "bootstrap/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "catarse-terraform-up-and-running-locks"
    encrypt        = true
  }
}