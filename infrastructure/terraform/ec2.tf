data "aws_ssm_parameter" "ubuntu_ami" {
  name = "/aws/service/canonical/ubuntu/server/24.04/stable/current/amd64/hvm/ebs-gp3/ami-id"
}

resource "aws_instance" "health_horizon" {
  ami                         = data.aws_ssm_parameter.ubuntu_ami.value
  key_name                    = aws_key_pair.health_horizon.key_name
  instance_type               = "t3.micro"
  subnet_id                   = aws_subnet.public.id
  vpc_security_group_ids      = [aws_security_group.application.id]
  associate_public_ip_address = true
  iam_instance_profile        = aws_iam_instance_profile.health_horizon.name

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
    encrypted   = true
  }

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  tags = {
    Name        = "health-horizon-server"
    Project     = "HealthHorizon"
    Environment = "development"
    ManagedBy   = "Terraform"
  }
}
