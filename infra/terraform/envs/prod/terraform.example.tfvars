# cp terraform.example.tfvars terraform.tfvars して値を埋める(terraform.tfvars は .gitignore 済み)。
# API トークンは tfvars に書かず、環境変数で渡すこと(DesignDoc §11.5):
#   export CLOUDFLARE_API_TOKEN=<token>
cloudflare_account_id = "0123456789abcdef0123456789abcdef"
