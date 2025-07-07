resource "aws_ecr_repository" "repo" {
    name = "app_repo"
    image_tag_mutability = "MUTABLEW"
    IMAGE_SCANNING_CONFIGURATION {
        scan_on_push = true
    }
}

