variable "cloudflare_account_id" {
  description = "Cloudflare アカウント ID(dashboard → Workers & Pages 右側で確認)"
  type        = string
}

variable "cloudflare_api_token" {
  description = "Cloudflare API トークン(権限: Account / D1:Edit + Workers KV Storage:Edit)。tfvars に書かず環境変数 CLOUDFLARE_API_TOKEN で渡すこと(§11.5)"
  type        = string
  sensitive   = true
  default     = null
}
