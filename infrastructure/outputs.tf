output "api_gateway_url" {
    value = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/dev/story"
    description = "Story URL for Story API"
}