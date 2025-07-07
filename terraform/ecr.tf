# terraform/ecr.tf
# ECR repository for storing Docker images

resource "aws_ecr_repository" "repo" {
    name                 = "app_repo"
    image_tag_mutability = "MUTABLE"
    
    image_scanning_configuration {
        scan_on_push = true
    }
    
    tags = {
        Name = "app-repository"
    }
}