# main.tf — Terraform and Provider Configuration
#
# CONCEPT: The terraform block defines requirements.
# The provider block tells Terraform HOW to authenticate
# with OCI — which credentials to use, which region to operate in.
#
# Think of the provider as the "login" step.
# Every API call Terraform makes uses these credentials.

terraform {
  required_version = ">= 1.0.0"

  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 6.0"
      # ~> 6.0 means "any 6.x version"
      # This prevents breaking changes from major version upgrades
    }
  }

  # CONCEPT: Local backend stores terraform.tfstate on your machine.
  # For a team you would use remote backend (OCI Object Storage, S3)
  # so everyone shares the same state file.
  # For a solo project, local is fine.
  backend "local" {
    path = "terraform.tfstate"
  }
}

provider "oci" {
  tenancy_ocid        = var.tenancy_ocid
  user_ocid           = var.user_ocid
  fingerprint         = var.fingerprint
  private_key         = file(var.private_key_path)
  region              = var.region
  # var.xxx reads the value from variables.tf / terraform.tfvars
}