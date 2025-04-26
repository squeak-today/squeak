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
  description = "GET, POST, etc. (used if http_methods is not provided)"
  type        = string
  default     = "GET"
}

variable "http_methods" {
  description = "List of HTTP methods to support (e.g., ['GET', 'POST'])"
  type        = list(string)
  default     = []
}

variable "lambda_arn" {
  description = "The ARN of the front Lambda function"
  type        = string
}

variable "is_resource_only" {
  description = "Whether to create a resource only (no methods)"
  type        = bool
  default     = false
}