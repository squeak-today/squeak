resource "aws_s3_bucket" "story_gen_bucket" {
    bucket = var.s3_bucket_name

    tags = {
        Name = "Story Generation Bucket"
    }

    force_destroy = true
}