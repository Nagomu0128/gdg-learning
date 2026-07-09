variable "account_id" {
  description = "Cloudflare アカウント ID"
  type        = string
}

variable "title" {
  description = "KV namespace 名(命名規約: gdg-learning-rate-limit-{env})"
  type        = string
}
