

// Define path
resource "aws_api_gateway_resource" "resource" {
    rest_api_id = var.rest_api_id
    parent_id = var.parent_id
    path_part = var.path_part
}

// Define the endpoint method
resource "aws_api_gateway_method" "method" {
    rest_api_id   = var.rest_api_id
    resource_id   = aws_api_gateway_resource.resource.id
    http_method   = var.http_method
    authorization = "NONE"
}

// Define endpoint response
resource "aws_api_gateway_method_response" "get_method_response" {
    rest_api_id = var.rest_api_id
    resource_id = aws_api_gateway_resource.resource.id
    http_method = aws_api_gateway_method.method.http_method
    status_code = "200"

    response_parameters = {
        "method.response.header.Access-Control-Allow-Origin" = true,
        "method.response.header.Access-Control-Allow-Methods" = true,
        "method.response.header.Access-Control-Allow-Headers" = true,
        "method.response.header.Access-Control-Max-Age" = true
    }
}

// Integrate
resource "aws_api_gateway_integration" "integration" {
	rest_api_id = var.rest_api_id
	resource_id = aws_api_gateway_resource.resource.id
	http_method = aws_api_gateway_method.method.http_method
	type = "AWS_PROXY"
	integration_http_method = "POST"
	uri = var.lambda_arn
}


// DEFINE OPTIONS FOR PREFLIGHTS
resource "aws_api_gateway_method" "options_method" {
    rest_api_id   = var.rest_api_id
    resource_id   = aws_api_gateway_resource.resource.id
    http_method   = "OPTIONS"
    authorization = "NONE"
}

resource "aws_api_gateway_method_response" "options_method_response" {
    rest_api_id = var.rest_api_id
    resource_id = aws_api_gateway_resource.resource.id
    http_method = aws_api_gateway_method.options_method.http_method
    status_code = "200"

    response_parameters = {
        "method.response.header.Access-Control-Allow-Origin" = true,
        "method.response.header.Access-Control-Allow-Methods" = true,
        "method.response.header.Access-Control-Allow-Headers" = true
    }
}

resource "aws_api_gateway_integration" "options_integration" {
    rest_api_id             = var.rest_api_id
    resource_id             = aws_api_gateway_resource.resource.id
    http_method             = aws_api_gateway_method.options_method.http_method
    type                    = "MOCK"
    passthrough_behavior    = "WHEN_NO_MATCH"
    request_templates       = {
        "application/json" = "{\"statusCode\": 200}"
    }
}

resource "aws_api_gateway_integration_response" "options_integration_response" {
    rest_api_id  = var.rest_api_id
    resource_id  = aws_api_gateway_resource.resource.id
    http_method  = aws_api_gateway_method.options_method.http_method
    status_code  = "200"

    response_parameters = {
        "method.response.header.Access-Control-Allow-Origin"  = "'*'" // unsafe currently
        "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,OPTIONS'"
        "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization'"
    }

    depends_on = [
        aws_api_gateway_integration.options_integration,
        aws_api_gateway_method_response.options_method_response
    ]
}