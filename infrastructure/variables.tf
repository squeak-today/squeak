variable "cohere_api_key" {
  description = "Cohere API Key for the Lambda function"
  type        = string
  sensitive   = true # Ensures the value doesn't show up in logs
}

variable "google_api_key" {
  description = "Google API Key for Lambda GCP Translate API"
  type        = string
  sensitive   = true
}

variable "gemini_api_key" {
  description = "Gemini API Key for Gemini API"
  type        = string
  sensitive   = true
}

variable "tavily_api_key" {
  description = "Tavily API Key for Web Search API"
  type        = string
  sensitive   = true
}


// SUPABASE VARIABLES, TRANSACTION POOLER PSQL
variable "supabase_host" {
  description = "Supabase Host"
  type        = string
  sensitive   = true
}

variable "supabase_port" {
  description = "Supabase Port"
  type        = string
  sensitive   = true
}

variable "supabase_user" {
  description = "Supabase User"
  type        = string
  sensitive   = true
}

variable "supabase_password" {
  description = "Supabase Password"
  type        = string
  sensitive   = true
}

variable "supabase_database" {
  description = "Supabase Database Name"
  type        = string
  sensitive   = true
}

variable "content_generation_interval" {
  description = "Content Generation Interval"
  type        = string
  default     = "rate(30 minutes)"
}

variable "supabase_jwt_secret" {
  description = "Supabase JWT Secret"
  type        = string
  sensitive   = true
}