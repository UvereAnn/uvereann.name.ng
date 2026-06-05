# compute.tf — AMD VM Instance (VM.Standard.E2.1.Micro)
#
# CONCEPT: We switched from ARM to AMD because OCI London
# has no ARM free tier capacity available.
#
# VM.Standard.E2.1.Micro is the AMD Always Free instance:
# - 1 OCPU (AMD)
# - 1GB RAM
# - Always available — no capacity issues
# - Free forever
#
# Because RAM is limited to 1GB, we run Node.js directly
# with PM2 instead of Docker on the VM.
# Docker is demonstrated locally and in GitHub Actions CI/CD.
#
# Real-world context: Many production deployments run
# Node.js + Nginx + PM2 without Docker on the server.
# This is a legitimate and common pattern.

# ── VM Instance ───────────────────────────────────────────────
resource "oci_core_instance" "portfolio_vm" {
  compartment_id      = var.compartment_ocid
  availability_domain = var.availability_domain
  display_name        = var.vm_name
  shape               = var.vm_shape

  # AMD E2.1.Micro does not use shape_config
  # It is a fixed shape — no flexible CPU/RAM

  source_details {
    source_type             = "image"
    source_id               = var.image_ocid
    boot_volume_size_in_gbs = 50
    # 50GB boot disk — Always Free includes up to 200GB total
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.portfolio_subnet.id
    assign_public_ip = false
    display_name     = "${var.vm_name}-vnic"

    freeform_tags = {
      "project" = var.project_name
    }
  }

  metadata = {
    ssh_authorized_keys = var.ssh_public_key

    # cloud-init — runs once on first boot
    # Opens ports in Ubuntu's internal firewall
    # OCI Security List handles the cloud-level firewall
    # but Ubuntu's iptables also needs to allow traffic
    user_data = base64encode(<<-EOF
      #!/bin/bash
      hostnamectl set-hostname uvereann-portfolio
      apt-get update -y
      apt-get upgrade -y
      iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
      iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
      iptables -I INPUT 6 -m state --state NEW -p tcp --dport 22 -j ACCEPT
      netfilter-persistent save
      echo "cloud-init complete" > /tmp/cloud-init-done
    EOF
    )
  }

  preserve_boot_volume = false

  freeform_tags = {
    "project" = var.project_name
  }

  timeouts {
    create = "20m"
  }
}