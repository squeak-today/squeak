
resource "random_string" "bucket_name" {
  length  = 12
  upper   = false
  special = false
}
resource "aws_s3_bucket" "story_gen_bucket" {
  bucket = "${terraform.workspace}-content-bucket-${random_string.bucket_name.result}"

  tags = {
    Name        = "${terraform.workspace} Story Generation Bucket"
    Environment = terraform.workspace
  }

  force_destroy = true
}