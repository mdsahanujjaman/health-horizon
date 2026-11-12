resource "aws_iam_role" "ec2_ecr_pull" {
  name = "HealthHorizon-EC2-ECR-Pull"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })

  tags = {
    Project   = "HealthHorizon"
    ManagedBy = "Terraform"
  }
}

resource "aws_iam_role_policy" "ecr_pull" {
  name = "HealthHorizon-ECR-Pull-Only"
  role = aws_iam_role.ec2_ecr_pull.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage"
        ]
        Resource = [
          for repository in aws_ecr_repository.application :
          repository.arn
        ]
      }
    ]
  })
}

resource "aws_iam_instance_profile" "health_horizon" {
  name = "HealthHorizon-EC2-Profile"
  role = aws_iam_role.ec2_ecr_pull.name
}
