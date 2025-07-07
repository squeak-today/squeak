# terraform/iam.tf
# IAM roles and policies for ECS

# ECS Task Execution Role
resource "aws_iam_role" "ecs_execution_role" {
    name = "ecs-execution-role"
    
    assume_role_policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
                Action = "sts:AssumeRole"
                Effect = "Allow"
                Principal = {
                    Service = "ecs-tasks.amazonaws.com"
                }
            }
        ]
    })
    
    tags = {
        Name = "ecs-execution-role"
    }
}

# Attach AWS managed policy for ECS task execution
resource "aws_iam_role_policy_attachment" "ecs_execution_role_policy" {
    role       = aws_iam_role.ecs_execution_role.name
    policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# ECS Instance Role (for EC2 instances running ECS agent)
resource "aws_iam_role" "ecs_instance_role" {
    name = "ecs-instance-role"
    
    assume_role_policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
                Action = "sts:AssumeRole"
                Effect = "Allow"
                Principal = {
                    Service = "ec2.amazonaws.com"
                }
            }
        ]
    })
    
    tags = {
        Name = "ecs-instance-role"
    }
}

# Attach AWS managed policy for ECS instances
resource "aws_iam_role_policy_attachment" "ecs_instance_role_policy" {
    role       = aws_iam_role.ecs_instance_role.name
    policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

# Instance profile for EC2 instances
resource "aws_iam_instance_profile" "ecs_instance_profile" {
    name = "ecs-instance-profile"
    role = aws_iam_role.ecs_instance_role.name
    
    tags = {
        Name = "ecs-instance-profile"
    }
}