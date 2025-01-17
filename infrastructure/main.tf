terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  cloud {
    organization = "squeak_team"
    workspaces {
      tags = ["shared"]
    }
  }

  required_version = ">= 1.2.0"
}

locals {
  environment = terraform.workspace
  prefix      = "${terraform.workspace}-"
}

module "generation" {
  source                  = "./generation"
  story_gen_bucket_arn    = aws_s3_bucket.story_gen_bucket.arn
  story_gen_bucket_bucket = aws_s3_bucket.story_gen_bucket.bucket

  aws_region     = var.aws_region
  cohere_api_key = var.cohere_api_key
  google_api_key = var.google_api_key
  tavily_api_key = var.tavily_api_key

  supabase_host     = var.supabase_host
  supabase_port     = var.supabase_port
  supabase_user     = var.supabase_user
  supabase_password = var.supabase_password
  supabase_database = var.supabase_database
}