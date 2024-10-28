data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

locals {
    account_id = data.aws_caller_identity.current.account_id
}

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
        name = "demo-lambda-policies"
        policy = jsonencode({
            "Version" : "2012-10-17",
            "Statement" : [
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
                }
            ]
        })
    }
}