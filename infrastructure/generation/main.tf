# GENERATION MODULE

# Queue filler lambda
# Story generation lambda

provider "aws" {
  region = var.aws_region
}


# SQS queue
resource "aws_sqs_queue" "story_gen_queue" {
	name = "story-gen-queue"
	delay_seconds = 0
	max_message_size = 262144  # 256kb
	message_retention_seconds = 345600  # 4 days
	receive_wait_time_seconds = 10

	# no dead letter queue assigned?
}