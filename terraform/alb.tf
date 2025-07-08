# terraform/alb.tf
# Application Load Balancer for snout API

# Security Group for ALB
resource "aws_security_group" "snout_alb_sg" {
    name   = "snout-alb-sg"
    vpc_id = aws_vpc.squeak_vpc.id
    
    # Ingress rules (incoming traffic from internet)
    ingress {
        description = "HTTP"
        from_port   = 80
        to_port     = 80
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }
    
    ingress {
        description = "HTTPS"
        from_port   = 443
        to_port     = 443
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }
    
    # Egress rules (outgoing traffic to ECS)
    egress {
        description = "All outbound traffic"
        from_port   = 0
        to_port     = 0
        protocol    = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }
    
    tags = {
        Name = "snout-alb-security-group"
    }
}

# Security Group for ECS (separate from ALB)
resource "aws_security_group" "snout_ecs_sg" {
    name   = "snout-ecs-sg"
    vpc_id = aws_vpc.squeak_vpc.id
    
    # Only allow traffic from ALB
    ingress {
        description     = "App Port from ALB"
        from_port       = 8080
        to_port         = 8080
        protocol        = "tcp"
        security_groups = [aws_security_group.snout_alb_sg.id]
    }
    
    # SSH access (for debugging)
    ingress {
        description = "SSH"
        from_port   = 22
        to_port     = 22
        protocol    = "tcp"
        cidr_blocks = ["10.0.0.0/16"]  # Only from within VPC
    }
    
    # Egress rules (outgoing traffic)
    egress {
        description = "All outbound traffic"
        from_port   = 0
        to_port     = 0
        protocol    = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }
    
    tags = {
        Name = "snout-ecs-security-group"
    }
}

# Application Load Balancer
resource "aws_lb" "snout_alb" {
    name               = "snout-alb"
    internal           = false  # Internet-facing
    load_balancer_type = "application"
    security_groups    = [aws_security_group.snout_alb_sg.id]
    subnets            = [aws_subnet.squeak_sn1.id, aws_subnet.squeak_sn2.id]
    
    enable_deletion_protection = false
    
    tags = {
        Name = "snout-application-load-balancer"
    }
}

# Target Group for ECS service
resource "aws_lb_target_group" "snout_tg" {
    name        = "snout-tg"
    port        = 8080
    protocol    = "HTTP"
    vpc_id      = aws_vpc.squeak_vpc.id
    target_type = "instance"  # For EC2 launch type
    
    health_check {
        enabled             = true
        healthy_threshold   = 2
        interval            = 60
        matcher             = "200"
        path                = "/health"
        port                = "traffic-port"
        protocol            = "HTTP"
        timeout             = 10
        unhealthy_threshold = 5
    }

    deregistration_delay = 30
    
    tags = {
        Name = "snout-target-group"
    }
}

# ALB Listener
resource "aws_lb_listener" "snout_listener" {
    load_balancer_arn = aws_lb.snout_alb.arn
    port              = "80"
    protocol          = "HTTP"
    
    default_action {
        type             = "forward"
        target_group_arn = aws_lb_target_group.snout_tg.arn
    }
    
    tags = {
        Name = "snout-alb-listener"
    }
}