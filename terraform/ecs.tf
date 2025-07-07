# terraform/ecs.tf
# ECS cluster, task definition, and service

# ECS Cluster
resource "aws_ecs_cluster" "ecs" {
    name = "app_cluster"
    
    tags = {
        Name = "app-cluster"
    }
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "app_logs" {
    name              = "/ecs/app"
    retention_in_days = 7
    
    tags = {
        Name = "app-logs"
    }
}

# ECS Task Definition
resource "aws_ecs_task_definition" "app" {
    family                = "app-task"
    network_mode          = "bridge"
    requires_compatibilities = ["EC2"]
    execution_role_arn    = aws_iam_role.ecs_execution_role.arn
    
    container_definitions = jsonencode([
        {
            name  = "app-container"
            image = "${aws_ecr_repository.repo.repository_url}:latest"
            memory = 512
            
            portMappings = [
                {
                    containerPort = 8080  # Your Go app port
                    hostPort      = 0     # Dynamic port mapping
                }
            ]
            
            logConfiguration = {
                logDriver = "awslogs"
                options = {
                    "awslogs-group"         = aws_cloudwatch_log_group.app_logs.name
                    "awslogs-region"        = "us-east-1"
                    "awslogs-stream-prefix" = "ecs"
                }
            }
            
            essential = true
        }
    ])
    
    tags = {
        Name = "app-task-definition"
    }
}

# ECS Service
resource "aws_ecs_service" "service" {
    name            = "app_service"
    cluster         = aws_ecs_cluster.ecs.id
    task_definition = aws_ecs_task_definition.app.arn
    desired_count   = 1
    launch_type     = "EC2"
    
    tags = {
        Name = "app-service"
    }
}