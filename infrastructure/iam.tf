data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

locals {
    account_id = data.aws_caller_identity.current.account_id
}

# Story Generation IAM (backend lambda)
resource "aws_iam_role" "story_gen_role" {
    name = "story-gen-role"

    assume_role_policy = jsonencode({
        "Version": "2012-10-17",
        "Statement": [
            {
                "Action": "sts:AssumeRole",
                "Principal": {
                    "Service": "lambda.amazonaws.com"
                },
                "Effect": "Allow"
            }
        ]
    })

    inline_policy {
        name = "lambda-policies"
        policy = jsonencode({
            "Version" : "2012-10-17",
            "Statement" : [
                # Cloudwatch Logs permissions
                {
                    "Effect" : "Allow",
                    "Action" : [
						"logs:CreateLogGroup",
                        "logs:CreateLogStream",
                        "logs:PutLogEvents"
                    ],
                    "Resource": [
						"${aws_cloudwatch_log_group.lambda_log_group.arn}",
						"${aws_cloudwatch_log_group.lambda_log_group.arn}:*"
					]
                },
                # S3 Permissions for storing stories
                {
                    "Effect": "Allow",
                    "Action": [
                        "s3:PutObject",
                        "s3:PutobjectAcl"
                    ],
                    "Resource": "${aws_s3_bucket.story_gen_bucket.arn}/*"
                },
				# SQS Permissions for pulling and reading queue
				{
					"Effect": "Allow",
					"Action": [
						"sqs:ReceiveMessage",
						"sqs:DeleteMessage",
						"sqs:GetQueueAttributes"
					],
					# this ARN is untested
					"Resource": "${aws_sqs_queue.story_gen_queue.arn}"
				}
            ]
        })
    }
}

# Story API IAM (frontend lambda)
resource "aws_iam_role" "story_api_role" {
    name = "story-api-role"

    assume_role_policy = jsonencode({
        "Version": "2012-10-17",
        "Statement": [
            {
                "Action": "sts:AssumeRole",
                "Principal": {
                    "Service": "lambda.amazonaws.com"
                },
                "Effect": "Allow"
            }
        ]
    })

    inline_policy {
        name = "lambda-policies"
        policy = jsonencode({
            "Version" : "2012-10-17",
            "Statement" : [
                # Cloudwatch Logs permissions
                {
                "Effect" : "Allow",
                "Action" : "logs:CreateLogGroup",
                "Resource" : "arn:aws:logs:${data.aws_region.current.name}:${local.account_id}:*"
                },
                {
                    "Effect" : "Allow",
                    "Action" : [
                        "logs:CreateLogStream",
                        "logs:PutLogEvents"
                    ],
                    "Resource" : [
                        "arn:aws:logs:${data.aws_region.current.name}:${local.account_id}:log-group:/aws/lambda/*:*"
                    ]
                },
                # S3 Permissions for getting the stories
                {
                    "Effect": "Allow",
                    "Action": [
                        "s3:GetObject",
                        "s3:ListBucket"
                    ],
                    "Resource": [
                        "arn:aws:s3:::${aws_s3_bucket.story_gen_bucket.id}",
                        "arn:aws:s3:::${aws_s3_bucket.story_gen_bucket.id}/*"
                    ]
                }
            ]
        })
    }
}