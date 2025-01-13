resource "aws_cloudwatch_log_group" "lambda_log_group2" {
  name = "/aws/lambda/story-api-lambda"
}

resource "aws_lambda_function" "story_api_lambda" {
  function_name = "story-api-lambda"
  role          = aws_iam_role.story_api_role.arn
  package_type  = "Zip"
  handler       = "storyapi"
  runtime       = "provided.al2"

  filename         = "front-function.zip"
  source_code_hash = filebase64sha256("front-function.zip")

  timeout = 30

  environment {
    variables = {
      STORY_BUCKET_NAME = aws_s3_bucket.story_gen_bucket.bucket
      GOOGLE_API_KEY    = var.google_api_key

      SUPABASE_HOST     = var.supabase_host
      SUPABASE_PORT     = var.supabase_port
      SUPABASE_USER     = var.supabase_user
      SUPABASE_PASSWORD = var.supabase_password
      SUPABASE_DATABASE = var.supabase_database
    }
  }

  depends_on = [
    aws_iam_role.story_api_role,
    aws_s3_bucket.story_gen_bucket,
    aws_cloudwatch_log_group.lambda_log_group2
  ]

  tags = {
    Name = "Story API Lambda"
  }
}