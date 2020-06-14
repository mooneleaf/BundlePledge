variable "cloudflare_email" {
  default     = "$CF_EMAIL"
  description = "Cloud Flare email"
}

variable "cloudflare_api_key" {
  default     = "$CF_API_KEY"
  description = "Cloud Flare API access token"
}
