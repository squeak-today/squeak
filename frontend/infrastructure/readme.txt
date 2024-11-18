AWS Amplify is the frontend service used to host the Squeak website.

The terraform code in this directory is used to create the Amplify app and manage the Amplify branches.

To deploy the frontend, you need to create a GitHub personal access token: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token-classic
Additionally, create a `terraform.tfvars` file with the following:
```
github_access_token = "ghp_....."
```

Then:
```
terraform init
terraform apply
```

```
terraform destroy
```
