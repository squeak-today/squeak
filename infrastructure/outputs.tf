output "api_gateway_url_story" {
  value       = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/${terraform.workspace}/story"
  description = "Story URL for Story API"
}

output "api_gateway_url_story_context" {
  value       = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/${terraform.workspace}/story/context"
  description = "Story Context URL for Story API"
}

output "api_gateway_url_news" {
  value       = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/${terraform.workspace}/news"
  description = "News URL for Story API"
}

output "api_gateway_url_news_query" {
  value       = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/${terraform.workspace}/news/query"
  description = "News Query URL for Story API"
}

output "api_gateway_url_story_query" {
  value       = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/${terraform.workspace}/story/query"
  description = "Story Query URL for Story API"
}

output "api_gateway_url_translate" {
  value       = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/${terraform.workspace}/translate"
  description = "Translate URL for Story API"
}

output "api_gateway_url_qna" {
  value       = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/${terraform.workspace}/qna"
  description = "QNA URL for Story API"
}

output "api_gateway_url_qna_evaluate" {
  value       = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/${terraform.workspace}/qna/evaluate"
  description = "QNA Evaluate URL for Story API"
}

output "api_gateway_url_profile" {
  value       = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/${terraform.workspace}/profile"
  description = "Profile URL for Story API"
}

output "api_gateway_url_profile_upsert" {
  value       = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/${terraform.workspace}/profile/upsert"
  description = "Profile Upsert URL for Story API"
}

output "api_gateway_url_progress" {
  value       = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/${terraform.workspace}/progress"
  description = "Progress URL for Story API"
}

output "api_gateway_url_progress_increment" {
  value       = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/${terraform.workspace}/progress/increment"
  description = "Progress Increment URL for Story API"
}

output "api_gateway_url_progress_streak" {
  value       = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/${terraform.workspace}/progress/streak"
  description = "Progress Streak URL for Story API"
}