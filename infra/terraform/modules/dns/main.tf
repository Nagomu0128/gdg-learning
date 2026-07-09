# DNS / カスタムドメイン module — 骨格のみ(SPEC K §1: MVP ではドメイン未定のため未実装)。
#
# ドメイン確定後の手順:
#   1. Cloudflare にゾーンを追加し zone_id を取得する(ゾーン自体を Terraform 管理するなら
#      cloudflare_zone リソースを追加し、レジストラのネームサーバーを切り替える)
#   2. 必要な DNS レコードを定義する。provider 5系ではリソース名が
#      cloudflare_record ではなく **cloudflare_dns_record** である点に注意
#   3. Worker へのルーティング(routes / custom domain)は wrangler.jsonc がオーナー
#      (DesignDoc §11.1「1リソース1オーナー」— Terraform では管理しない)
#
# resource "cloudflare_dns_record" "app" {
#   zone_id = var.zone_id
#   name    = "app" # app.example.com
#   type    = "CNAME"
#   content = "codesteps.<subdomain>.workers.dev"
#   proxied = true
#   ttl     = 1 # proxied レコードは 1(auto)固定
# }

terraform {
  required_version = ">= 1.6.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = ">= 5.0.0, < 6.0.0"
    }
  }
}
