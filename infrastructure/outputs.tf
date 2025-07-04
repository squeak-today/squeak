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

output "api_gateway_url_teacher" {
  value       = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/${terraform.workspace}/teacher"
  description = "Teacher URL for Story API"
}

output "api_gateway_url_teacher_classroom" {
  value       = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/${terraform.workspace}/teacher/classroom"
  description = "Teacher Classroom URL for Story API"
}

output "api_gateway_url_teacher_classroom_create" {
  value       = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/${terraform.workspace}/teacher/classroom/create"
  description = "Teacher Classroom Create URL for Story API"
}

output "api_gateway_url_student" {
  value       = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/${terraform.workspace}/student"
  description = "Student URL for Story API"
}

output "api_gateway_url_student_classroom" {
  value       = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/${terraform.workspace}/student/classroom"
  description = "Student Classroom URL for Story API"
}

output "api_gateway_url_student_classroom_join" {
  value       = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/${terraform.workspace}/student/classroom/join"
  description = "Student Classroom Join URL for Story API"
}

output "api_gateway_url_student_classroom_accept" {
  value       = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/${terraform.workspace}/student/classroom/accept"
  description = "Teacher Classroom Accept URL for Story API"
}

output "api_gateway_url_teacher_classroom_reject" {
  value       = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/${terraform.workspace}/teacher/classroom/reject"
  description = "Teacher Classroom Reject URL for Story API"
}

output "api_gateway_url_audio" {
  value       = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/${terraform.workspace}/audio"
  description = "Audio base URL for Story API"
}

output "api_gateway_url_audio_translate" {
  value       = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/${terraform.workspace}/audio/translate"
  description = "Audio Translation URL for Story API"
}

output "api_gateway_url_audio_tts" {
  value       = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/${terraform.workspace}/audio/tts"
  description = "Audio Text-to-Speech URL for Story API"
}

output "api_gateway_url_deck" {
  value       = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/${terraform.workspace}/deck"
  description = "Deck URL for Story API (GET to list, POST to create)"
}

output "api_gateway_url_deck_id" {
  value       = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/${terraform.workspace}/deck/{deck_id}"
  description = "Specific Deck URL for Story API (GET, PUT, DELETE operations)"
}

output "api_gateway_url_flashcard_create" {
  value       = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/${terraform.workspace}/flashcard/create"
  description = "Flashcard Create URL for Story API (POST to create a flashcard)"
}

output "api_gateway_url_flashcard_id_update" {
  value       = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/${terraform.workspace}/flashcard/{flashcard_id}/update"
  description = "Flashcard Update URL for Story API (POST to update a flashcard)"
}

output "api_gateway_url_flashcard_id_delete" {
  value       = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/${terraform.workspace}/flashcard/{flashcard_id}/delete"
  description = "Flashcard Delete URL for Story API (POST to delete a flashcard)"
}

output "api_gateway_url_deck_id_delete" {
  value       = "https://${aws_api_gateway_rest_api.story_api.id}.execute-api.us-east-2.amazonaws.com/${terraform.workspace}/deck/{deck_id}/delete"
  description = "Deck Delete URL for Story API (POST to delete a deck)"
}