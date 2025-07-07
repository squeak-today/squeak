# terraform/ec2.tf
# EC2 instances for ECS cluster

# Launch Template for ECS instances
resource "aws_launch_template" "ecs" {
    name_prefix   = "ecs-template"
    image_id      = "ami-0c02fb55956c7d316"  # ECS-optimized AMI for us-east-1
    instance_type = "t3.micro"               # Free tier eligible
    
    vpc_security_group_ids = [aws_security_group.sg.id]
    
    iam_instance_profile {
        name = aws_iam_instance_profile.ecs_instance_profile.name
    }
    
    user_data = base64encode(<<-EOF
        #!/bin/bash
        echo ECS_CLUSTER=${aws_ecs_cluster.ecs.name} >> /etc/ecs/ecs.config
    EOF
    )
    
    tag_specifications {
        resource_type = "instance"
        tags = {
            Name = "ecs-instance"
        }
    }
}

# Auto Scaling Group
resource "aws_autoscaling_group" "ecs" {
    name                = "ecs-asg"
    vpc_zone_identifier = [aws_subnet.sn1.id, aws_subnet.sn2.id]
    min_size            = 1
    max_size            = 2
    desired_capacity    = 1
    
    launch_template {
        id      = aws_launch_template.ecs.id
        version = "$Latest"
    }
    
    tag {
        key                 = "Name"
        value               = "ecs-instance"
        propagate_at_launch = true
    }
}