terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"
}

module "generation" {
	source = "./generation"
	story_gen_bucket_arn = aws_s3_bucket.story_gen_bucket.arn
	story_gen_bucket_bucket = aws_s3_bucket.story_gen_bucket.bucket

	aws_region = var.aws_region
	cohere_api_key = var.cohere_api_key
	google_api_key = var.google_api_key
	tavily_api_key = var.tavily_api_key
}