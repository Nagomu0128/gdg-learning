variable "account_id" {
  description = "Cloudflare アカウント ID"
  type        = string
}

variable "name" {
  description = "D1 データベース名(命名規約: codesteps-{env})"
  type        = string
}
