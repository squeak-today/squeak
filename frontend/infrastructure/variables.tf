variable "github_access_token" {
  description = "GitHub personal access token for Amplify repository access. This is used to allow Amplify to access the Squeak repository and deploy the frontend. To generate a token, https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token-classic "
  type        = string
  sensitive   = true
}
