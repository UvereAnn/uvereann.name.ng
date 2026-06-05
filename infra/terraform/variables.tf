# variables.tf — All input variable declarations
#
# CONCEPT: Variables in Terraform work like function parameters.
# You declare them here (name, type, description).
# You provide their values in terraform.tfvars.
# This separation means secrets never appear in code files.

variable "tenancy_ocid" {
  description = "OCID of your OCI tenancy (root compartment)"
  type        = string
  sensitive   = true
}

variable "user_ocid" {
  description = "OCID of your OCI user account"
  type        = string
  sensitive   = true
}

variable "fingerprint" {
  description = "Fingerprint of the API key added to your OCI user"
  type        = string
  sensitive   = true
}

variable "private_key_path" {
  description = "Full path to the OCI API private key on your local machine"
  type        = string
  default     = "/home/ann-uvere/.oci/oci_api_key.pem"
}

variable "region" {
  description = "OCI region where all resources will be created"
  type        = string
  default     = "uk-london-1"
}

variable "compartment_ocid" {
  description = "OCID of the compartment to create resources in"
  type        = string
  sensitive   = true
}

variable "availability_domain" {
  description = "Availability domain for the compute instance"
  type        = string
  default     = "sBDG:UK-LONDON-1-AD-1"
}

variable "ssh_public_key" {
  description = "SSH public key to install on the VM for access"
  type        = string
}

variable "vm_shape" {
  description = "Compute shape for the VM"
  type        = string
  default     = "VM.Standard.E2.1.Micro"
  # AMD Always Free — 1 OCPU, 1GB RAM
  # Always available unlike ARM which has capacity issues
}

variable "vm_name" {
  description = "Display name for the VM instance"
  type        = string
  default     = "uvereann-portfolio-vm"
}

variable "project_name" {
  description = "Tag applied to all resources for easy identification"
  type        = string
  default     = "uvereann-portfolio"
}

variable "image_ocid" {
  description = "OCID of the Ubuntu OS image for the VM"
  type        = string
  # Get the correct value by running:
  # oci compute image list \
  #   --compartment-id YOUR_TENANCY_OCID \
  #   --operating-system "Canonical Ubuntu" \
  #   --shape "VM.Standard.E2.1.Micro" \
  #   --sort-by TIMECREATED --sort-order DESC --limit 3 \
  #   --query 'data[*].{"name":"display-name","id":"id"}' \
  #   --output table
}