# apply 後、以下を app/wrangler.jsonc へ手動転記する(運用手順は docs/RUNBOOK.md):
#   d1_database_id  → d1_databases[].database_id(binding: DB)
#   kv_namespace_id → kv_namespaces[].id(binding: RATE_LIMIT_KV)
output "d1_database_id" {
  description = "wrangler.jsonc の d1_databases[].database_id へ転記"
  value       = module.d1.database_id
}

output "d1_database_name" {
  value = module.d1.database_name
}

output "kv_namespace_id" {
  description = "wrangler.jsonc の kv_namespaces[].id へ転記"
  value       = module.rate_limit_kv.namespace_id
}
