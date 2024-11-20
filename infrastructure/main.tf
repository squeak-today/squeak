provider "aws" {
	region = "us-east-2"  # Adjust the region as needed
}

resource "aws_cognito_user_pool" "user_pool" {
	name = "user-pool"

	username_attributes = ["email"]
	auto_verified_attributes = ["email"]

	password_policy {
		minimum_length = 8
		require_lowercase = true
		require_uppercase = true
		require_numbers = true
		require_symbols = true
	}

	admin_create_user_config {
    	allow_admin_create_user_only = false
	}
}