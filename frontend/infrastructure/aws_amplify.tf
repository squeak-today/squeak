resource "aws_amplify_app" "squeak_app" {
    name         = "squeak"
    repository   = "https://github.com/squeak-today/squeak"
    access_token = var.github_access_token

    # Enable auto branch creation
    enable_auto_branch_creation = true

    # Enable branch auto-build and deploy
    enable_branch_auto_build = true

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


