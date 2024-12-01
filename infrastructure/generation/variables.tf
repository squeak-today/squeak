variable "aws_region" {
  type = string
  description = "The AWS region"
}

variable "story_gen_bucket_arn" {
	type = string
	description = "ARN of story_gen_bucket"
}

variable "story_gen_bucket_bucket" {
	type = string
	description = "Bucket name of story_gen_bucket"
}

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