# Development with Terraform and HCP Cloud

We use HCP Cloud to manage our Terraform state.
We have a `dev` and `prod` workspace.

It is recommended to run `terraform login` and `terraform init` in the `infrastructure` directory. `terraform login` will prompt you for a token and install it somewhere locally.

## First-Time Setup
You will need to create `dev.tfvars` and `prod.tfvars` files in `infrastructure/environments`.

Example:
```sh
cohere_api_key    = "key"
google_api_key    = "key"
gemini_api_key    = "key"
tavily_api_key    = "key"
supabase_host     = "xxxxxx.supabase.com"
supabase_port     = "6543"
supabase_user     = "postgres.xxxxx..."
supabase_password = "xxxxx..."
supabase_database = "postgres"
content_generation_interval = "rate(30 minutes)" # or cron(0 13 * * ? *) for prod
supabase_jwt_secret = "xxxxx..."
```

```sh
# Dev
terraform workspace select dev
# confirm with
terraform workspace show
terraform init
terraform plan -var-file="environments/dev.tfvars"
terraform apply -var-file="environments/dev.tfvars"

# When ready for production
terraform workspace select prod
terraform init
terraform plan -var-file="environments/prod.tfvars"
terraform apply -var-file="environments/prod.tfvars"
```

**IMPORTANT:** PLEASE USE PROD VARIABLES IN `prod.tfvars` FOR PRODUCTION. (or incur billing to yourself, I guess)

# PLEASE TRIPLE TRIPLE CHECK IF YOU ARE NOT IN THE PROD WORKSPACE WHEN DESTROYING
If ever needed, `terraform destroy -var-file="environments/dev.tfvars"`.
Please don't do this without quintuple checking (...especially prod.)

State variables will thus be stored on the cloud.

## Testing in Own AWS Account
Comment out the `cloud` block in `main.tf`.
```sh
terraform init -migrate-state  # This will copy it from cloud. if you want to start fresh, don't use this flag.
terraform plan -var-file="terraform.tfvars"
terraform apply -var-file="terraform.tfvars"
```

To go back, you can uncomment and run `terraform init -migrate-state` again (only if the changes you had in your own account are being pushed to dev).
Remember to ignore `terraform.tfstate` in `.gitignore`!!!