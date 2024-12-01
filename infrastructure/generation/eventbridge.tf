resource "aws_cloudwatch_event_rule" "lambda_trigger" {
  name                = "lambda-trigger"
  description         = "Fires every 5 minutes"
  schedule_expression = "rate(5 minutes)"
}

# Trigger lambda based on the schedule
resource "aws_cloudwatch_event_target" "trigger_lambda_on_schedule" {
  rule = aws_cloudwatch_event_rule.lambda_trigger.name
  target_id = "lambda"
  arn = aws_lambda_function.story_gen_lambda.arn
}