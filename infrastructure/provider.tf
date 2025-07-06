provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  default = "us-east-1"
}