output "database_id" {
  description = "D1 database ID。app/wrangler.jsonc の d1_databases[].database_id へ手動転記する(§11.1: Worker 設定は wrangler.jsonc が SSOT)"
  value       = cloudflare_d1_database.this.id
}

output "database_name" {
  description = "D1 database 名"
  value       = cloudflare_d1_database.this.name
}
