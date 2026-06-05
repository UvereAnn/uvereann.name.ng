# ip.tf — Reserved Public IP Address
#
# CONCEPT: There are two types of public IPs in OCI:
#
# Ephemeral IP: assigned automatically, changes if VM restarts
# Reserved IP:  you own it, stays the same forever
#
# We use a RESERVED IP because:
# - Your DNS A record points to this IP
# - If the IP changed every restart, your domain would break
# - You can destroy and recreate the VM and keep the same IP
# - The IP is associated with your account, not the VM

# ── Reserve a public IP ───────────────────────────────────────
resource "oci_core_public_ip" "portfolio_ip" {
  compartment_id = var.compartment_ocid
  lifetime       = "RESERVED"
  display_name   = "${var.project_name}-public-ip"

  # Attach to the VM's network interface (VNIC)
  private_ip_id  = data.oci_core_private_ips.portfolio_private_ip.private_ips[0].id

  freeform_tags = {
    "project" = var.project_name
  }
}

# ── Look up the VM's private IP ───────────────────────────────
# CONCEPT: To attach a public IP, OCI needs the ID of the
# private IP on the VM's network card (VNIC).
# We use a data source to find it after the VM is created.
data "oci_core_vnic_attachments" "portfolio_vnic" {
  compartment_id = var.compartment_ocid
  instance_id    = oci_core_instance.portfolio_vm.id
}

data "oci_core_vnic" "portfolio_vnic" {
  vnic_id = data.oci_core_vnic_attachments.portfolio_vnic.vnic_attachments[0].vnic_id
}

data "oci_core_private_ips" "portfolio_private_ip" {
  vnic_id = data.oci_core_vnic.portfolio_vnic.id
}
