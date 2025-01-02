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

	verification_message_template {
		default_email_option = "CONFIRM_WITH_CODE"
		email_message = "Your verification code is {####}"
		email_subject = "Verify your email"
	}

}

resource "aws_cognito_user_pool_client" "app_client" {
	name = "squeak_app_client"
	user_pool_id = aws_cognito_user_pool.user_pool.id

	explicit_auth_flows = [ // defaults
		"ALLOW_CUSTOM_AUTH",
		"ALLOW_USER_SRP_AUTH",
		"ALLOW_REFRESH_TOKEN_AUTH",
	]

	generate_secret = false
}

resource "aws_cognito_user_pool_domain" "user_pool_domain" {
	domain = "squeak-auth"
	user_pool_id = aws_cognito_user_pool.user_pool.id
}

output "user_pool_id" {
	value = aws_cognito_user_pool.user_pool.id
}

output "app_client_id" {
	value = aws_cognito_user_pool_client.app_client.id
}