# terraform/outputs.tf
# Output values after deployment

output "snout_alb_dns_name" {
    description = "DNS name of the snout ALB"
    value       = aws_lb.snout_alb.dns_name
}

output "snout_api_url" {
    description = "Public URL for the snout API"
    value       = "http://${aws_lb.snout_alb.dns_name}"
}

output "snout_health_check_url" {
    description = "Health check URL for snout API"
    value       = "http://${aws_lb.snout_alb.dns_name}/health"
}

output "ecr_repository_url" {
    description = "ECR repository URL for pushing Docker images"
    value       = aws_ecr_repository.snout_repo.repository_url
}

output "ecs_cluster_name" {
    description = "Name of the ECS cluster"
    value       = aws_ecs_cluster.squeak_cluster.name
}

output "vpc_id" {
    description = "ID of the VPC"
    value       = aws_vpc.squeak_vpc.id
}

output "deployment_commands" {
    description = "Commands to build and deploy your snout API"
    value = <<-EOT
        # Build and push Docker image:
        aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${aws_ecr_repository.snout_repo.repository_url}
        cd snout
        docker build -t snout-api .
        docker tag snout-api:latest ${aws_ecr_repository.snout_repo.repository_url}:latest
        docker push ${aws_ecr_repository.snout_repo.repository_url}:latest
        
        # Force new deployment:
        aws ecs update-service --cluster ${aws_ecs_cluster.squeak_cluster.name} --service ${aws_ecs_service.snout_service.name} --force-new-deployment --region us-east-1
        
        # Your API will be available at:
        # http://${aws_lb.snout_alb.dns_name}
    EOT
}