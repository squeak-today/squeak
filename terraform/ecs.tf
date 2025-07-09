# terraform/ecs.tf
# ECS cluster, task definition, and service

# ECS Cluster (shared by snout and future whisker)
resource "aws_ecs_cluster" "squeak_cluster" {
    name = "squeak-cluster"
    
    tags = {
        Name = "squeak-cluster"
    }
}

# CloudWatch Log Group for snout
resource "aws_cloudwatch_log_group" "snout_logs" {
    name              = "/ecs/snout"
    retention_in_days = 7
    
    tags = {
        Name = "snout-logs"
    }
}

# ECS Task Definition for snout
resource "aws_ecs_task_definition" "snout_task" {
    family                = "snout-api-task"
    network_mode          = "bridge"
    requires_compatibilities = ["EC2"]
    execution_role_arn    = aws_iam_role.ecs_execution_role.arn
    
    container_definitions = jsonencode([
        {
            name  = "snout-api-container"
            image = "${aws_ecr_repository.snout_repo.repository_url}:latest"
            memory = 256 
            
            portMappings = [
                {
                    containerPort = 8080
                    hostPort      = 0
                }
            ]
            
            environment = [
                {
                    name  = "WORKSPACE"
                    value = "prod"
                },
                {
                    name  = "GIN_MODE"
                    value = "release"
                },
                {
                    name  = "AWS_REGION"
                    value = "us-east-1"
                },
                {
                    name  = "SUPABASE_HOST"
                    value = var.supabase_host
                },
                {
                    name  = "SUPABASE_PORT"
                    value = var.supabase_port
                },
                {
                    name  = "SUPABASE_USER"
                    value = var.supabase_user
                },
                {
                    name  = "SUPABASE_PASSWORD"
                    value = var.supabase_password
                },
                {
                    name  = "SUPABASE_DATABASE"
                    value = var.supabase_database
                },
                {
                    name  = "JWT_SECRET"
                    value = var.supabase_jwt_secret
                },
                {
                    name  = "GOOGLE_API_KEY"
                    value = var.google_api_key
                },
                {
                    name  = "ELEVENLABS_API_KEY"
                    value = var.elevenlabs_api_key
                },
                {
                    name  = "GEMINI_API_KEY"
                    value = var.gemini_api_key
                },
                {
                    name  = "COHERE_API_KEY"
                    value = var.cohere_api_key
                },
                {
                    name  = "TAVILY_API_KEY"
                    value = var.tavily_api_key
                },
                {
                    name  = "STRIPE_KEY"
                    value = var.stripe_key
                },
                {
                    name  = "STRIPE_WEBHOOK_SECRET"
                    value = var.stripe_webhook_secret
                }
            ]
            
            logConfiguration = {
                logDriver = "awslogs"
                options = {
                    "awslogs-group"         = aws_cloudwatch_log_group.snout_logs.name
                    "awslogs-region"        = "us-east-1"
                    "awslogs-stream-prefix" = "ecs"
                }
            }
            
            essential = true
        }
    ])
    
    tags = {
        Name = "snout-api-task-definition"
    }
}

# ECS Service for snout
resource "aws_ecs_service" "snout_service" {
    name            = "snout-api-service"
    cluster         = aws_ecs_cluster.squeak_cluster.id
    task_definition = aws_ecs_task_definition.snout_task.arn
    desired_count   = 1
    launch_type     = "EC2"
    
    load_balancer {
        target_group_arn = aws_lb_target_group.snout_tg.arn
        container_name   = "snout-api-container"
        container_port   = 8080
    }
    
    depends_on = [aws_lb_listener.snout_listener]
    
    tags = {
        Name = "snout-api-service"
    }
}