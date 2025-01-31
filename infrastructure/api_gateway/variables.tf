variable "rest_api_id" {
  description = "ID of the API Gateway"
  type        = string
}

variable "parent_id" {
  description = "root resource of StoryAPI"
  type        = string
}

variable "path_part" {
  description = "path for the new resource (e.g 'story', 'news')"
  type        = string
}

variable "http_method" {
  description = "GET, POST, etc."
  type        = string
  default     = "GET"
}

variable "lambda_arn" {
  description = "The ARN of the front Lambda function"
  type        = string
}