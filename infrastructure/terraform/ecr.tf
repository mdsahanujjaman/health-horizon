locals {
  ecr_repositories = toset([
    "health-horizon-frontend",
    "health-horizon-backend",
    "health-horizon-ml"
  ])
}

resource "aws_ecr_repository" "application" {
  for_each = local.ecr_repositories

  name                 = each.value
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = {
    Project   = "HealthHorizon"
    ManagedBy = "Terraform"
  }
}
