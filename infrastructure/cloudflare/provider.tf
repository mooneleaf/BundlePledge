provider "cloudflare" {
  version = "~> 2.0"
  email   = var.cloudflare_email
  api_key = var.cloudflare_api_key
}

provider "aws" {
  version = ">= 2.28.1"
  region  = var.region
}
