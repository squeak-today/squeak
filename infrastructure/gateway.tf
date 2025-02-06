resource "aws_api_gateway_rest_api" "story_api" {
  name        = "${terraform.workspace}-StoryAPI"
  description = "Simple API for Front Lambda function"
}

module "content" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = aws_api_gateway_rest_api.story_api.root_resource_id
  path_part   = "content"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

module "story" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = aws_api_gateway_rest_api.story_api.root_resource_id
  path_part   = "story"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

module "news" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = aws_api_gateway_rest_api.story_api.root_resource_id
  path_part   = "news"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

module "translate" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = aws_api_gateway_rest_api.story_api.root_resource_id
  path_part   = "translate"
  http_method = "POST"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

module "evaluate_qna" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = aws_api_gateway_rest_api.story_api.root_resource_id
  path_part   = "evaluate-qna"
  http_method = "POST"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

module "news_query" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = aws_api_gateway_rest_api.story_api.root_resource_id
  path_part   = "news-query"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

module "story_query" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = aws_api_gateway_rest_api.story_api.root_resource_id
  path_part   = "story-query"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

module "content_question" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = aws_api_gateway_rest_api.story_api.root_resource_id
  path_part   = "content-question"
  http_method = "POST"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

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
  parent_id   = aws_api_gateway_rest_api.story_api.root_resource_id
  path_part   = "profile-upsert"
  http_method = "POST"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

// Define Lambda permissions
resource "aws_lambda_permission" "allow_apigateway" {
  statement_id  = "${terraform.workspace}-AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.story_api_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.story_api.execution_arn}/*/*"
}

# DEPLOY
resource "aws_api_gateway_deployment" "api_deployment" {
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  stage_name  = terraform.workspace

  depends_on = [
    module.story,
    module.news,
    module.translate,
    module.evaluate_qna,
    module.news_query,
    module.story_query,
    module.content_question,
  ]
}
