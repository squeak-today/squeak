# Add these to your existing terraform/variables.tf
variable "cohere_api_key" {
  description = "Cohere API key"
  type        = string
  sensitive   = true
}

variable "google_api_key" {
  description = "Google API key"
  type        = string
  sensitive   = true
}

variable "gemini_api_key" {
  description = "Gemini API key"
  type        = string
  sensitive   = true
}

variable "tavily_api_key" {
  description = "Tavily API key"
  type        = string
  sensitive   = true
}

variable "supabase_host" {
  description = "Supabase database host"
  type        = string
  sensitive   = true
}

variable "supabase_port" {
  description = "Supabase database port"
  type        = string
  default     = "6543"
}

variable "supabase_user" {
  description = "Supabase database user"
  type        = string
  sensitive   = true
}

variable "supabase_password" {
  description = "Supabase database password"
  type        = string
  sensitive   = true
}

variable "supabase_database" {
  description = "Supabase database name"
  type        = string
  default     = "postgres"
}

variable "supabase_jwt_secret" {
  description = "Supabase JWT secret"
  type        = string
  sensitive   = true
}

variable "stripe_key" {
  description = "Stripe API key"
  type        = string
  sensitive   = true
}

variable "stripe_webhook_secret" {
  description = "Stripe webhook secret"
  type        = string
  sensitive   = true
}

variable "elevenlabs_api_key" {
  description = "ElevenLabs API key"
  type        = string
  sensitive   = true
}

variable "content_generation_interval" {
  description = "Cron expression for content generation"
  type        = string
  default     = "cron(0 13 ? * MON,WED,FRI *)"
}