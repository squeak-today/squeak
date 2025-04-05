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
module "teacher" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = aws_api_gateway_rest_api.story_api.root_resource_id
  path_part   = "teacher"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

module "teacher_classroom" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = module.teacher.resource_id
  path_part   = "classroom"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

module "teacher_classroom_update" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = module.teacher_classroom.resource_id
  path_part   = "update"
  http_method = "POST"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

module "teacher_classroom_content" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = module.teacher_classroom.resource_id
  path_part   = "content"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

module "teacher_classroom_create" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = module.teacher_classroom.resource_id
  path_part   = "create"
  http_method = "POST"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

module "teacher_classroom_delete" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = module.teacher_classroom.resource_id
  path_part   = "delete"
  http_method = "POST"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

module "teacher_classroom_accept" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = module.teacher_classroom.resource_id
  path_part   = "accept"
  http_method = "POST"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

module "teacher_classroom_reject" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = module.teacher_classroom.resource_id
  path_part   = "reject"
  http_method = "POST"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

# Audio endpoints
module "audio" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = aws_api_gateway_rest_api.story_api.root_resource_id
  path_part   = "audio"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

module "audio_translate" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = module.audio.resource_id
  path_part   = "translate"
  http_method = "POST"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

module "audio_tts" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = module.audio.resource_id
  path_part   = "tts"
  http_method = "POST"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

module "audio_stt" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = module.audio.resource_id
  path_part   = "stt"
  http_method = "POST"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

module "student" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = aws_api_gateway_rest_api.story_api.root_resource_id
  path_part   = "student"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

module "student_classroom" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = module.student.resource_id
  path_part   = "classroom"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

module "student_classroom_join" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = module.student_classroom.resource_id
  path_part   = "join"
  http_method = "POST"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

# module "webhook" {
#   source      = "./api_gateway"
#   rest_api_id = aws_api_gateway_rest_api.story_api.id
#   parent_id   = aws_api_gateway_rest_api.story_api.root_resource_id
#   path_part   = "webhook"
#   http_method = "POST"
#   lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
# }

module "organization" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = aws_api_gateway_rest_api.story_api.root_resource_id
  path_part   = "organization"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

module "organization_create" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = module.organization.resource_id
  path_part   = "create"
  http_method = "POST"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

module "organization_join" {
  source      = "./api_gateway"
  rest_api_id = aws_api_gateway_rest_api.story_api.id
  parent_id   = module.organization.resource_id
  path_part   = "join"
  http_method = "POST"
  lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
}

# Deck endpoints
# Deck endpoints
module "deck" {
  source       = "./api_gateway"
  rest_api_id  = aws_api_gateway_rest_api.story_api.id
  parent_id    = aws_api_gateway_rest_api.story_api.root_resource_id
  path_part    = "deck"
  http_methods = ["GET", "POST"]  # GET to list decks, POST to create a deck
  lambda_arn   = aws_lambda_function.story_api_lambda.invoke_arn
}

module "deck_id" {
  source       = "./api_gateway"
  rest_api_id  = aws_api_gateway_rest_api.story_api.id
  parent_id    = module.deck.resource_id
  path_part    = "{deck_id}"
  http_methods = ["GET", "PUT", "DELETE"]  # CRUD operations on a specific deck
  lambda_arn   = aws_lambda_function.story_api_lambda.invoke_arn
}

# module "organization_payments" {
#   source      = "./api_gateway"
#   rest_api_id = aws_api_gateway_rest_api.story_api.id
#   parent_id   = module.organization.resource_id
#   path_part   = "payments"
#   lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
# }

# module "organization_payments_create_checkout_session" {
#   source      = "./api_gateway"
#   rest_api_id = aws_api_gateway_rest_api.story_api.id
#   parent_id   = module.organization_payments.resource_id
#   path_part   = "create-checkout-session"
#   http_method = "POST"
#   lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
# }

# module "organization_payments_cancel_subscription_eop" {
#   source      = "./api_gateway"
#   rest_api_id = aws_api_gateway_rest_api.story_api.id
#   parent_id   = module.organization_payments.resource_id
#   path_part   = "cancel-subscription-eop"
#   http_method = "POST"
#   lambda_arn  = aws_lambda_function.story_api_lambda.invoke_arn
# }

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

  depends_on = [
    aws_api_gateway_deployment.api_deployment
  ]

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
    module.qna,
    module.qna_evaluate,
    module.progress,
    module.progress_streak,
    module.progress_increment,
    module.teacher,
    module.teacher_classroom,
    module.teacher_classroom_update,
    module.teacher_classroom_content,
    module.teacher_classroom_create,
    module.teacher_classroom_accept,
    module.teacher_classroom_reject,
    module.student,
    module.student_classroom,
    module.student_classroom_join,
    module.audio,
    module.audio_translate,
    module.audio_tts,
    module.audio_stt,
    module.organization,
    module.organization_create,
    module.organization_join,
    module.deck,
    module.deck_id,
    // module.organization_payments,
    // module.organization_payments_create_checkout_session,
    // module.organization_payments_cancel_subscription_eop
  ]
}

