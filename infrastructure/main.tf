terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region  = "us-east-2"
}

resource "aws_instance" "app_server" {
  ami           = "ami-050cd642fd83388e4" # amazon linux 2023 AMI
  instance_type = "t2.micro"

  tags = {
    Name = "ec2-squeak"
  }
}