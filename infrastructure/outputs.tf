output "api_gateway_url_story" {
  value       = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/dev/story"
  description = "Story URL for Story API"
}

output "api_gateway_url_news" {
  value       = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/dev/news"
  description = "News URL for Story API"
}

output "api_gateway_url_translate" {
  value       = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/dev/translate"
  description = "Translate URL for Story API"
}

output "api_gateway_url_news_query" {
  value       = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/dev/news-query"
  description = "News Query URL for Story API"
}

output "api_gateway_url_story_query" {
  value       = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/dev/story-query"
  description = "Story Query URL for Story API"
}