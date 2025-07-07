# terraform/ec2.tf
# EC2 instances for ECS cluster

# Launch Template for ECS instances
resource "aws_launch_template" "squeak_ecs_template" {
    name_prefix   = "squeak-ecs-template"
    image_id      = "ami-0c02fb55956c7d316"  # ECS-optimized AMI for us-east-1
    instance_type = "t3.micro"               
    
    vpc_security_group_ids = [aws_security_group.snout_ecs_sg.id]
    
    iam_instance_profile {
        name = aws_iam_instance_profile.ecs_instance_profile.name
    }
    
    user_data = base64encode(<<-EOF
        #!/bin/bash
        echo ECS_CLUSTER=${aws_ecs_cluster.squeak_cluster.name} >> /etc/ecs/ecs.config
    EOF
    )
    
    tag_specifications {
        resource_type = "instance"
        tags = {
            Name = "squeak-ecs-instance"
        }
    }
}

# Auto Scaling Group
resource "aws_autoscaling_group" "squeak_ecs_asg" {
    name                = "squeak-ecs-asg"
    vpc_zone_identifier = [aws_subnet.squeak_sn1.id, aws_subnet.squeak_sn2.id]
    min_size            = 1
    max_size            = 2
    desired_capacity    = 1
    
    launch_template {
        id      = aws_launch_template.squeak_ecs_template.id
        version = "$Latest"
    }
    
    tag {
        key                 = "Name"
        value               = "squeak-ecs-instance"
        propagate_at_launch = true
    }
}