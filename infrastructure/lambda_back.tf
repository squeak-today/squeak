# Known issue is that regardless of dependency, possibly due to drifting, aws_cloudwatch_log_group is not able to be destroyed
# if you specify fields like retention.
# https://github.com/hashicorp/terraform/issues/14750
# The obvious fix is thus to wait until Lambda creates one upon invocation, in which case you still need to manually delete it after
# But for now this works because it defines basically nothing changeable.
resource "aws_cloudwatch_log_group" "lambda_log_group" {
    name = "/aws/lambda/story-gen-lambda"
}

// standard
resource "aws_lambda_function" "story_gen_lambda" {
    function_name = "story-gen-lambda"
    role = aws_iam_role.story_gen_role.arn
    package_type = "Zip"
    handler = "storygen"
    runtime = "provided.al2"

    filename = "function.zip"
    source_code_hash = filebase64sha256("function.zip")

    timeout = 900

    # cohere env vars
    environment {
        variables = {
			GOOGLE_API_KEY = var.google_api_key
            COHERE_API_KEY = var.cohere_api_key
			TAVILY_API_KEY = var.tavily_api_key
            STORY_BUCKET_NAME = aws_s3_bucket.story_gen_bucket.bucket
        }
    }

    depends_on = [
        aws_iam_role.story_gen_role,
        aws_s3_bucket.story_gen_bucket,
        aws_cloudwatch_log_group.lambda_log_group
    ]

    tags = {
        Name = "Story Generation Lambda"
    }
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_split_lambda" {
    statement_id  = "AllowExecutionFromCloudWatch"
    action        = "lambda:InvokeFunction"
    function_name = aws_lambda_function.story_gen_lambda.function_name
    principal     = "events.amazonaws.com"
    source_arn    = aws_cloudwatch_event_rule.lambda_trigger.arn
}