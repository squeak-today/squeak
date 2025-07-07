# terraform/ecr.tf
# ECR repository for storing Docker images

resource "aws_ecr_repository" "snout_repo" {
    name                 = "snout-api"
    image_tag_mutability = "MUTABLE"
    
    image_scanning_configuration {
        scan_on_push = true
    }
    
    tags = {
        Name = "snout-api-repository"
    }
}