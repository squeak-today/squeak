
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

# block all public access
resource "aws_s3_bucket_public_access_block" "story_gen_bucket_public_access_block" {
  bucket = aws_s3_bucket.story_gen_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# cors config for presigned urls
resource "aws_s3_bucket_cors_configuration" "story_gen_bucket_cors" {
  bucket = aws_s3_bucket.story_gen_bucket.id

  cors_rule {
    allowed_headers = ["If-Match", "If-None-Match"]
    allowed_methods = ["GET"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 600
  }
}