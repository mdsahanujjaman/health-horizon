output "ecr_repository_urls" {
  description = "URLs of Health Horizon ECR repositories"
  value = {
    for name, repository in aws_ecr_repository.application :
    name => repository.repository_url
  }
}

output "ec2_instance_id" {
  description = "Health Horizon EC2 instance ID"
  value       = aws_instance.health_horizon.id
}

output "ec2_public_ip" {
  description = "Health Horizon EC2 public IP"
  value       = aws_instance.health_horizon.public_ip
}
