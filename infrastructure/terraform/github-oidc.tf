resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = [
    "sts.amazonaws.com"
  ]

  tags = {
    Name    = "HealthHorizon-GitHub-OIDC"
    Project = "HealthHorizon"
  }
}

resource "aws_iam_role" "github_actions" {
  name = "HealthHorizon-GitHub-Actions"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = aws_iam_openid_connect_provider.github.arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          "token.actions.githubusercontent.com:sub" = "repo:mdsahanujjaman/health-horizon:ref:refs/heads/devops-implementation"
        }
      }
    }]
  })

  tags = {
    Project   = "HealthHorizon"
    ManagedBy = "Terraform"
  }
}

resource "aws_iam_role_policy" "github_ecr_push" {
  name = "HealthHorizon-GitHub-ECR-Push"
  role = aws_iam_role.github_actions.id

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
          "ecr:CompleteLayerUpload",
          "ecr:InitiateLayerUpload",
          "ecr:PutImage",
          "ecr:UploadLayerPart"
        ]
        Resource = [
          for repository in aws_ecr_repository.application :
          repository.arn
        ]
      }
    ]
  })
}

output "github_actions_role_arn" {
  description = "IAM role assumed by GitHub Actions"
  value       = aws_iam_role.github_actions.arn
}
