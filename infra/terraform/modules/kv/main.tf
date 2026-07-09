# Workers KV namespace(DesignDoc §11.1: KV のオーナーは Terraform。用途: レート制限 §10.4)
terraform {
  required_version = ">= 1.6.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = ">= 5.0.0, < 6.0.0"
    }
  }
}

resource "cloudflare_workers_kv_namespace" "this" {
  account_id = var.account_id
  title      = var.title
}
