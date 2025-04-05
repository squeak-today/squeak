// Define path
resource "aws_api_gateway_resource" "resource" {
  rest_api_id = var.rest_api_id
  parent_id   = var.parent_id
  path_part   = var.path_part
}

// Define the endpoint methods
resource "aws_api_gateway_method" "methods" {
  count         = length(var.http_methods) > 0 ? length(var.http_methods) : (var.is_resource_only ? 0 : 1)
  rest_api_id   = var.rest_api_id
  resource_id   = aws_api_gateway_resource.resource.id
  http_method   = length(var.http_methods) > 0 ? var.http_methods[count.index] : var.http_method
  authorization = "NONE"
}

// Define endpoint responses
resource "aws_api_gateway_method_response" "method_responses" {
  count       = length(var.http_methods) > 0 ? length(var.http_methods) : (var.is_resource_only ? 0 : 1)
  rest_api_id = var.rest_api_id
  resource_id = aws_api_gateway_resource.resource.id
  http_method = aws_api_gateway_method.methods[count.index].http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Max-Age"       = true
  }
}

// Integrate
resource "aws_api_gateway_integration" "integrations" {
  count                   = length(var.http_methods) > 0 ? length(var.http_methods) : (var.is_resource_only ? 0 : 1)
  rest_api_id             = var.rest_api_id
  resource_id             = aws_api_gateway_resource.resource.id
  http_method             = aws_api_gateway_method.methods[count.index].http_method
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = var.lambda_arn
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
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Headers" = true
  }
}

resource "aws_api_gateway_integration" "options_integration" {
  rest_api_id          = var.rest_api_id
  resource_id          = aws_api_gateway_resource.resource.id
  http_method          = aws_api_gateway_method.options_method.http_method
  type                 = "MOCK"
  passthrough_behavior = "WHEN_NO_MATCH"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration_response" "options_integration_response" {
  rest_api_id = var.rest_api_id
  resource_id = aws_api_gateway_resource.resource.id
  http_method = aws_api_gateway_method.options_method.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'*'" // Consider narrowing this for security
    "method.response.header.Access-Control-Allow-Methods" = length(var.http_methods) > 0 ? "'OPTIONS,${join(",", var.http_methods)}'" : "'OPTIONS,${var.http_method}'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization'"
  }

  depends_on = [
    aws_api_gateway_integration.options_integration,
    aws_api_gateway_method_response.options_method_response
  ]
}

output "resource_id" {
  value = aws_api_gateway_resource.resource.id
}