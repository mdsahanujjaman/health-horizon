data "aws_availability_zones" "available" {
  state = "available"
}

resource "aws_vpc" "health_horizon" {
  cidr_block           = "10.20.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name        = "health-horizon-vpc"
    Project     = "HealthHorizon"
    Environment = "development"
    ManagedBy   = "Terraform"
  }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.health_horizon.id
  cidr_block              = "10.20.1.0/24"
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true

  tags = {
    Name      = "health-horizon-public-subnet"
    Project   = "HealthHorizon"
    ManagedBy = "Terraform"
  }
}

resource "aws_internet_gateway" "health_horizon" {
  vpc_id = aws_vpc.health_horizon.id

  tags = {
    Name    = "health-horizon-igw"
    Project = "HealthHorizon"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.health_horizon.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.health_horizon.id
  }

  tags = {
    Name    = "health-horizon-public-rt"
    Project = "HealthHorizon"
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

resource "aws_security_group" "application" {
  name        = "health-horizon-application-sg"
  description = "Restricted access for Health Horizon development server"
  vpc_id      = aws_vpc.health_horizon.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH - authorized administrator only"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.admin_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "health-horizon-application-sg"
    Project = "HealthHorizon"
  }
}
