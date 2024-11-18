data "aws_region" "current" {}
resource "aws_amplify_app" "squeak_app" {
    name         = "squeak"
    repository   = "https://github.com/squeak-today/squeak"
    access_token = var.github_access_token


    # Build settings
    build_spec = <<-EOT
        version: 1
        applications:
        - frontend:
            phases:
                preBuild:
                    commands:
                        - cd frontend
                        - npm ci
                build:
                    commands:
                        - npm run build
            artifacts:
                baseDirectory: frontend/build
                files:
                - '**/*'
            cache:
                paths:
                - frontend/node_modules/**/*
    EOT
}

# Create branch for main
resource "aws_amplify_branch" "main" {
    app_id      = aws_amplify_app.squeak_app.id
    branch_name = "main"

    framework = "React"
    stage     = "PRODUCTION"

    enable_auto_build = true
}

// the auto build feature of the TF provider is not working, https://github.com/hashicorp/terraform-provider-aws/issues/19870
// so we need to trigger a deployment manually
resource "null_resource" "trigger_amplify_deployment" {
  depends_on = [aws_amplify_branch.main]

  # Force this command to be triggered every time this terraform file is ran
  triggers = {
    always_run = "${timestamp()}"
  }

  # The command to be ran
  provisioner "local-exec" {
    command = "aws amplify start-job --app-id ${aws_amplify_app.squeak_app.id} --branch-name ${aws_amplify_branch.main.branch_name} --job-type RELEASE --region ${data.aws_region.current.name}"
    }
}


# Default domain output
output "default_domain" {
    description = "The default domain of the Amplify app"
    value       = "https://${aws_amplify_branch.main.branch_name}.${aws_amplify_app.squeak_app.default_domain}"
}