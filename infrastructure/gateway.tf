resource "aws_api_gateway_rest_api" "story_api" {
  name        = "${terraform.workspace}-StoryAPI"
  description = "Simple API for Front Lambda function"
}

# Story endpoints
module "story" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = aws_api_gateway_rest_api.story_api.root_resource_id
  path_part   = "story"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

module "story_context" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = module.story.resource_id
  path_part   = "context"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

module "story_query" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = module.story.resource_id
  path_part   = "query"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

# News endpoints
module "news" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = aws_api_gateway_rest_api.story_api.root_resource_id
  path_part   = "news"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

module "news_query" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = module.news.resource_id
  path_part   = "query"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

# Profile endpoints
module "profile" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = aws_api_gateway_rest_api.story_api.root_resource_id
  path_part   = "profile"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

module "profile_upsert" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = module.profile.resource_id
  path_part   = "upsert"
  http_method = "POST"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

# Other endpoints
module "translate" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = aws_api_gateway_rest_api.story_api.root_resource_id
  path_part   = "translate"
  http_method = "POST"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

# QNA endpoints
module "qna" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = aws_api_gateway_rest_api.story_api.root_resource_id
  path_part   = "qna"
  http_method = "POST"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

module "qna_evaluate" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = module.qna.resource_id
  path_part   = "evaluate"
  http_method = "POST"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

# Progress endpoints
module "progress" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = aws_api_gateway_rest_api.story_api.root_resource_id
  path_part   = "progress"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

module "progress_increment" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = module.progress.resource_id
  path_part   = "increment"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

module "progress_streak" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = module.progress.resource_id
  path_part   = "streak"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

# Classroom endpoints
module "classroom" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = aws_api_gateway_rest_api.story_api.root_resource_id
  path_part   = "classroom"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

# Lambda permissions
resource "aws_lambda_permission" "allow_apigateway" {
  statement_id  = "${terraform.workspace}-AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.story_api_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.story_api.execution_arn}/*/*"
}

# Deploy
resource "aws_api_gateway_deployment" "api_deployment" {
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  stage_name  = terraform.workspace

  depends_on = [
    module.story,
    module.story_context,
    module.story_query,
    module.news,
    module.news_query,
    module.profile,
    module.profile_upsert,
    module.translate,
    module.qna,
    module.qna_evaluate,
    module.progress,
    module.progress_streak,
    module.progress_increment,
    module.classroom
  ]
}
