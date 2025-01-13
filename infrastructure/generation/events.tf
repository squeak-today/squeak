
####### TRIGGERING LAMBDA ON TIMED INTERVALS (for the SQS filler) #######
resource "aws_cloudwatch_event_rule" "lambda_trigger" {
  name                = "lambda-trigger"
  description         = "Fires every 30 minutes"
  schedule_expression = "rate(30 minutes)"
}

# Trigger lambda based on the schedule
resource "aws_cloudwatch_event_target" "trigger_lambda_on_schedule" {
  rule      = aws_cloudwatch_event_rule.lambda_trigger.name
  target_id = "lambda"
  arn       = aws_lambda_function.queue_filler_lambda.arn
}

####### TRIGGERING LAMBDA VIA SQS QUEUE (for the story generators) #######
resource "aws_lambda_event_source_mapping" "sqs_lambda_trigger" {
  event_source_arn = aws_sqs_queue.story_gen_queue.arn
  function_name    = aws_lambda_function.story_gen_lambda.arn
  batch_size       = 10 # 10 msgs per lambda
}