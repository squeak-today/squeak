resource "aws_api_gateway_rest_api" "story_api" {
    name = "StoryAPI"
    description = "Simple GET API for Front Lambda function"
}

// DEFINING ALL THE PATHS

resource "aws_api_gateway_resource" "story_resource" {
    rest_api_id = aws_api_gateway_rest_api.story_api.id
    parent_id = aws_api_gateway_rest_api.story_api.root_resource_id
    path_part = "story"
}

resource "aws_api_gateway_method" "get_story" {
    rest_api_id   = aws_api_gateway_rest_api.story_api.id
    resource_id   = aws_api_gateway_resource.story_resource.id
    http_method   = "GET"
    authorization = "NONE"
}

// GATEWAY INTEGRATION

resource "aws_api_gateway_integration" "lambda_integration" {
    rest_api_id = aws_api_gateway_rest_api.story_api.id
    resource_id = aws_api_gateway_resource.story_resource.id
    http_method = aws_api_gateway_method.get_story.http_method
    type = "AWS_PROXY"
    integration_http_method = "POST"
    uri = aws_lambda_function.story_api_lambda.invoke_arn
}

# DEPLOY
resource "aws_api_gateway_deployment" "api_deployment" {
    rest_api_id = aws_api_gateway_rest_api.story_api.id
    stage_name  = "dev"

    depends_on = [
        aws_api_gateway_integration.lambda_integration
    ]
}

# PERMISSIONS

resource "aws_lambda_permission" "allow_apigateway" {
    statement_id  = "AllowExecutionFromAPIGateway"
    action = "lambda:InvokeFunction"
    function_name = aws_lambda_function.story_api_lambda.function_name
    principal = "apigateway.amazonaws.com"
    // source_arn = "${aws_api_gateway_rest_api.story_api.execution_arn}/*"
    source_arn = "${aws_api_gateway_rest_api.story_api.execution_arn}/*/*"
}