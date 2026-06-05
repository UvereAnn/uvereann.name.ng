# outputs.tf — Values printed after terraform apply
#
# CONCEPT: Outputs are Terraform's way of surfacing important
# values after it finishes running. Think of them like the
# return value of a function.
#
# After terraform apply completes, you will see:
# vm_public_ip = "123.456.789.0"
# You then use this IP to:
# 1. Update your DNS A record on Whogohost
# 2. Set the VM_HOST in your Ansible inventory
# 3. Add to GitHub Actions secrets

output "vm_public_ip" {
  description = "Public IP address of the portfolio VM — use this for DNS"
  value       = oci_core_public_ip.portfolio_ip.ip_address
}

output "vm_private_ip" {
  description = "Private IP address of the VM within the VCN"
  value       = data.oci_core_vnic.portfolio_vnic.private_ip_address
}

output "vm_id" {
  description = "OCID of the VM instance"
  value       = oci_core_instance.portfolio_vm.id
}

output "ssh_command" {
  description = "Command to SSH into your VM"
  value       = "ssh -i ~/.ssh/oracle_vm_key ubuntu@${oci_core_public_ip.portfolio_ip.ip_address}"
}

output "next_steps" {
  description = "What to do after terraform apply"
  value       = <<-EOT
    ✅ Infrastructure created successfully!

    1. Update DNS on Whogohost:
       A record: uvereann.name.ng → ${oci_core_public_ip.portfolio_ip.ip_address}

    2. SSH into your VM:
       ssh -i ~/.ssh/oracle_vm_key ubuntu@${oci_core_public_ip.portfolio_ip.ip_address}

    3. Run Ansible to configure the VM:
       cd ../ansible && ansible-playbook -i inventory.ini playbook.yml
  EOT
}
