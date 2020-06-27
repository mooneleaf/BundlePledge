provider "cloudflare" {
  version = "~> 2.0"
}

provider "aws" {
  version = ">= 2.28.1"
  region  = var.region
}
