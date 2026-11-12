variable "admin_cidr" {
  description = "Public IPv4 CIDR allowed to access the server over SSH"
  type        = string

  validation {
    condition     = can(cidrnetmask(var.admin_cidr))
    error_message = "admin_cidr must be a valid IPv4 CIDR."
  }
}

variable "public_key_path" {
  description = "Path to the Health Horizon EC2 public SSH key"
  type        = string
  default     = "~/.ssh/health-horizon-key.pub"
}
