resource "aws_cloudwatch_log_group" "filler_log_group" {
  name = "/aws/lambda/${terraform.workspace}-queue-filler-lambda"
}

resource "aws_lambda_function" "queue_filler_lambda" {
  function_name = "${terraform.workspace}-queue-filler-lambda"
  role          = aws_iam_role.queue_filler_role.arn
  package_type  = "Zip"
  handler       = "queuefill"
  runtime       = "provided.al2"

  filename         = "filler-function.zip"
  source_code_hash = filebase64sha256("filler-function.zip")

  timeout = 900

  environment {
    variables = {
      SQS_QUEUE_URL = aws_sqs_queue.story_gen_queue.name
    }
  }

  depends_on = [
    aws_iam_role.queue_filler_role,
    aws_sqs_queue.story_gen_queue,
    aws_cloudwatch_log_group.filler_log_group
  ]

  tags = {
    Name = "${terraform.workspace} Queue Filler Lambda"
  }
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_split_lambda" {
  statement_id  = "${terraform.workspace}-AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.queue_filler_lambda.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.lambda_trigger.arn
}