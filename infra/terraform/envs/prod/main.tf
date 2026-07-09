# CodeSteps prod 環境(DesignDoc §11.2)。
# 適用手順は docs/RUNBOOK.md「Terraform」参照。apply 後、outputs の ID を app/wrangler.jsonc へ手動転記する。
terraform {
  required_version = ">= 1.6.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }

  # ---- tfstate バックエンド(DesignDoc §11.5) ----
  # 既定: local backend(このディレクトリの terraform.tfstate)。
  # ⚠ 警告: tfstate にはリソース情報が平文で残り得る。コミット禁止(.gitignore 済み)、
  #   かつ保管先のアクセス制御を必須とする(§11.5)。チーム/CI 運用に移行する際は
  #   下記いずれかのリモートバックエンドへ移行する(terraform init -migrate-state)。
  #
  # (A) Cloudflare R2(S3 互換)バックエンド:
  # backend "s3" {
  #   bucket = "codesteps-tfstate"
  #   key    = "prod/terraform.tfstate"
  #   region = "auto"
  #   endpoints = {
  #     s3 = "https://<ACCOUNT_ID>.r2.cloudflarestorage.com"
  #   }
  #   # 認証: R2 API トークンを環境変数 AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY で渡す
  #   skip_credentials_validation = true
  #   skip_region_validation      = true
  #   skip_requesting_account_id  = true
  #   skip_metadata_api_check     = true
  #   skip_s3_checksum            = true
  #   use_path_style              = true
  # }
  #
  # (B) Terraform Cloud:
  # cloud {
  #   organization = "<org>"
  #   workspaces {
  #     name = "codesteps-prod"
  #   }
  # }
}

provider "cloudflare" {
  # API トークンは tfvars に書かない(§11.5)。var 未指定時は環境変数 CLOUDFLARE_API_TOKEN が使われる。
  api_token = var.cloudflare_api_token
}

locals {
  env = "prod"
}

module "d1" {
  source     = "../../modules/d1"
  account_id = var.cloudflare_account_id
  name       = "codesteps-${local.env}"
}

module "rate_limit_kv" {
  source     = "../../modules/kv"
  account_id = var.cloudflare_account_id
  title      = "codesteps-rate-limit-${local.env}"
}

# DNS(カスタムドメイン)はドメイン未定のため未使用(modules/dns の骨格コメント参照)。
