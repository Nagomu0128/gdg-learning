# 骨格のみ(main.tf のコメント参照)。ドメイン確定後に records 変数等を追加する。
variable "zone_id" {
  description = "Cloudflare ゾーン ID(ドメイン確定後に使用)"
  type        = string
  default     = null
}
