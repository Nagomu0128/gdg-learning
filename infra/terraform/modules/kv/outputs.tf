output "namespace_id" {
  description = "KV namespace ID。app/wrangler.jsonc の kv_namespaces[].id へ手動転記する(§11.1: Worker 設定は wrangler.jsonc が SSOT)"
  value       = cloudflare_workers_kv_namespace.this.id
}

output "title" {
  description = "KV namespace 名"
  value       = cloudflare_workers_kv_namespace.this.title
}
