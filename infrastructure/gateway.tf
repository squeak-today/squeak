resource "aws_api_gateway_rest_api" "story_api" {
    name = "StoryAPI"
    description = "Simple API for Front Lambda function"
}

module "story" {
	source            = "./api_gateway"
	rest_api_id       = aws_api_gateway_rest_api.story_api.id
	parent_id         = aws_api_gateway_rest_api.story_api.root_resource_id
	path_part         = "story"
	lambda_arn        = aws_lambda_function.story_api_lambda.invoke_arn
}

module "news" {
	source            = "./api_gateway"
	rest_api_id       = aws_api_gateway_rest_api.story_api.id
	parent_id         = aws_api_gateway_rest_api.story_api.root_resource_id
	path_part         = "news"
	lambda_arn        = aws_lambda_function.story_api_lambda.invoke_arn
}

module "translate" {
	source            = "./api_gateway"
	rest_api_id       = aws_api_gateway_rest_api.story_api.id
	parent_id         = aws_api_gateway_rest_api.story_api.root_resource_id
	path_part         = "translate"
	http_method       = "POST"
	lambda_arn        = aws_lambda_function.story_api_lambda.invoke_arn
}

// Define Lambda permissions
resource "aws_lambda_permission" "allow_apigateway" {
    statement_id  = "AllowExecutionFromAPIGateway"
    action = "lambda:InvokeFunction"
    function_name = aws_lambda_function.story_api_lambda.function_name
    principal = "apigateway.amazonaws.com"
    source_arn = "${aws_api_gateway_rest_api.story_api.execution_arn}/*/*"
}

# DEPLOY
resource "aws_api_gateway_deployment" "api_deployment" {
    rest_api_id = aws_api_gateway_rest_api.story_api.id
    stage_name  = "dev"

    depends_on = [
        module.story,
		module.news
    ]
}