# terraform/main.tf
# Main Terraform configuration for Squeak ECS deployment

terraform {
  required_version = ">= 1.2.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "Squeak"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_availability_zones" "available" {
  state = "available"
}

# Local values
locals {
  account_id = data.aws_caller_identity.current.account_id
  azs        = slice(data.aws_availability_zones.available.names, 0, 2)
  
  common_tags = {
    Project     = "Squeak"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Networking module
module "networking" {
  source = "./modules/networking"
  
  project_name = var.project_name
  environment  = var.environment
  vpc_cidr     = var.vpc_cidr
  azs          = local.azs
}

# Secrets module
module "secrets" {
  source = "./modules/secrets"
  
  project_name        = var.project_name
  environment         = var.environment
  supabase_host       = var.supabase_host
  supabase_port       = var.supabase_port
  supabase_user       = var.supabase_user
  supabase_password   = var.supabase_password
  supabase_database   = var.supabase_database
  supabase_jwt_secret = var.supabase_jwt_secret
  google_api_key      = var.google_api_key
  elevenlabs_api_key  = var.elevenlabs_api_key
  gemini_api_key      = var.gemini_api_key
  cohere_api_key      = var.cohere_api_key
  tavily_api_key      = var.tavily_api_key
  stripe_key          = var.stripe_key
  stripe_webhook_secret = var.stripe_webhook_secret
}

# Application Load Balancer module
module "alb" {
  source = "./modules/alb"
  
  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.networking.vpc_id
  public_subnet_ids  = module.networking.public_subnet_ids
  alb_security_group_id = module.networking.alb_security_group_id
}

# ECS module
module "ecs" {
  source = "./modules/ecs"
  
  project_name            = var.project_name
  environment             = var.environment
  aws_region              = var.aws_region
  account_id              = local.account_id
  vpc_id                  = module.networking.vpc_id
  private_subnet_ids      = module.networking.public_subnet_ids # Using public subnets for free tier
  ecs_security_group_id   = module.networking.ecs_security_group_id
  target_group_arn        = module.alb.target_group_arn
  execution_role_arn      = module.networking.ecs_execution_role_arn
  task_role_arn           = module.networking.ecs_task_role_arn
  
  # Container configuration
  container_port          = var.container_port
  container_cpu           = var.container_cpu
  container_memory        = var.container_memory
  desired_count           = var.desired_count
  
  depends_on = [
    module.networking,
    module.alb,
    module.secrets
  ]
}