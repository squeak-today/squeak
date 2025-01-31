# Story Generation IAM (back lambda)
resource "aws_iam_role" "story_gen_role" {
  name = "${terraform.workspace}-story-gen-role"

  assume_role_policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Action" : "sts:AssumeRole",
        "Principal" : {
          "Service" : "lambda.amazonaws.com"
        },
        "Effect" : "Allow"
      }
    ]
  })

  inline_policy {
    name = "${terraform.workspace}-lambda-policies"
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
          "Resource" : [
            "${aws_cloudwatch_log_group.lambda_log_group.arn}",
            "${aws_cloudwatch_log_group.lambda_log_group.arn}:*"
          ]
        },
        # S3 Permissions for storing stories
        {
          "Effect" : "Allow",
          "Action" : [
            "s3:PutObject",
            "s3:PutobjectAcl"
          ],
          "Resource" : "${var.story_gen_bucket_arn}/*"
        },
        # SQS Permissions for pulling and reading queue
        {
          "Effect" : "Allow",
          "Action" : [
            "sqs:ReceiveMessage",
            "sqs:DeleteMessage",
            "sqs:GetQueueAttributes"
          ],
          # this ARN is untested
          "Resource" : "${aws_sqs_queue.story_gen_queue.arn}"
        }
      ]
    })
  }
}

resource "aws_iam_role" "queue_filler_role" {
  name = "${terraform.workspace}-queue-filler-role"

  assume_role_policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Action" : "sts:AssumeRole",
        "Principal" : {
          "Service" : "lambda.amazonaws.com"
        },
        "Effect" : "Allow"
      }
    ]
  })

  inline_policy {
    name = "${terraform.workspace}-lambda_policies"
    policy = jsonencode({
      "Version" : "2012-10-17",
      "Statement" : [
        {
          "Effect" : "Allow",
          "Action" : [
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents"
          ],
          "Resource" : [
            "${aws_cloudwatch_log_group.filler_log_group.arn}",
            "${aws_cloudwatch_log_group.filler_log_group.arn}:*"
          ]
        },
        {
          "Effect" : "Allow"
          "Action" : [
            "sqs:SendMessage"
          ],
          "Resource" : aws_sqs_queue.story_gen_queue.arn
        }
      ]
    })
  }
}