variable "cohere_api_key" {
    description = "Cohere API Key for the Lambda function"
    type        = string
    sensitive   = true  # Ensures the value doesn't show up in logs
}

variable "google_api_key" {
	description = "Google API Key for Lambda GCP Translate API"
	type = string
	sensitive = true
}

variable "tavily_api_key" {
	description = "Tavily API Key for Web Search API"
	type = string
	sensitive = true
}

variable "s3_bucket_name" {
    description = "S3 Bucket ID for storing stories"
    type = string
}