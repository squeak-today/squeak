
resource "random_string" "bucket_name" {
    length  = 12
    upper   = false
    special = false
}
resource "aws_s3_bucket" "story_gen_bucket" {
    bucket = random_string.bucket_name.result

    tags = {
        Name = "Story Generation Bucket"
    }

    force_destroy = true
}