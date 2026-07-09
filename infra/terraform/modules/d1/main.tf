# D1 データベース(DesignDoc §11.1: D1 のオーナーは Terraform)
terraform {
  required_version = ">= 1.6.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = ">= 5.0.0, < 6.0.0"
    }
  }
}

resource "cloudflare_d1_database" "this" {
  account_id = var.account_id
  name       = var.name
}
