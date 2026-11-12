resource "aws_key_pair" "health_horizon" {
  key_name   = "health-horizon-key"
  public_key = file(pathexpand(var.public_key_path))

  tags = {
    Name    = "health-horizon-key"
    Project = "HealthHorizon"
  }
}
