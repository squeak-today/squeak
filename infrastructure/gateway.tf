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

# Lambda permissions
resource "aws_lambda_permission" "allow_apigateway" {
  statement_id  = "${terraform.workspace}-AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.story_api_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.story_api.execution_arn}/*/*"
}

resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/apigateway/${terraform.workspace}-StoryAPI"
  retention_in_days = 7
}

resource "aws_iam_role" "api_gateway_cloudwatch" {
  name = "${terraform.workspace}-api-gateway-cloudwatch"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "apigateway.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "api_gateway_cloudwatch" {
  name = "${terraform.workspace}-api-gateway-cloudwatch"
  role = aws_iam_role.api_gateway_cloudwatch.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams",
          "logs:PutLogEvents",
          "logs:GetLogEvents",
          "logs:FilterLogEvents"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_api_gateway_stage" "api_stage" {
  deployment_id = aws_api_gateway_deployment.api_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.story_api.id
  stage_name    = terraform.workspace

  lifecycle {
    create_before_destroy = true
  }

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format = jsonencode({
      requestId            = "$context.requestId"
      sourceIp             = "$context.identity.sourceIp"
      requestTime          = "$context.requestTime"
      protocol             = "$context.protocol"
      httpMethod           = "$context.httpMethod"
      resourcePath         = "$context.resourcePath"
      routeKey             = "$context.routeKey"
      status               = "$context.status"
      responseLength       = "$context.responseLength"
      integrationError     = "$context.integration.error"
      integrationStatus    = "$context.integration.status"
      integrationLatency   = "$context.integration.latency"
      integrationRequestId = "$context.integration.requestId"
      errorMessage         = "$context.error.message"
      errorMessageString   = "$context.error.messageString"
    })
  }

  depends_on = [
    aws_api_gateway_deployment.api_deployment
  ]
}

resource "aws_api_gateway_account" "api_gateway" {
  cloudwatch_role_arn = aws_iam_role.api_gateway_cloudwatch.arn
}

resource "aws_api_gateway_deployment" "api_deployment" {
  rest_api_id = aws_api_gateway_rest_api.story_api.id

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
    module.progress_increment
  ]
}
