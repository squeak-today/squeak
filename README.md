# Squeak Story Generation and REST API Backend

1. Build Go binaries with `./build-for-lambda.sh` which compiles, zips, and places in `infrastructure/`.
2. Create `terraform.tfvars` with the following format:
```
cohere_api_key = "cohere-key-here"
google_api_key = "google-key-here"
tavily_api_key = "tvly-key-here"
```
3. `cd infrastructure`, call:
```
terraform init
terraform apply

// and later:
terraform destroy
```
4. Either wait for S3 to be populated after the story generation lambda is invoked or invoke manually. The REST API endpoint should be ready for use.

## **POST** `/story`
`https://<api-id>.execute-api.us-east-2.amazonaws.com/dev/story?language=French&cefr=B2&subject=Politics&contentType=News`
**Description:**
Pulls generated story as JSON. Pass `language`, `cefr`, `subject`, and `contentType` as fields.
