# security.tf — Security List (Firewall Rules)
#
# CONCEPT: A Security List is OCI's firewall.
# It defines ingress (incoming) and egress (outgoing) rules.
# By default everything is DENIED — you explicitly allow what you need.
#
# We allow:
# Port 22  — SSH so you can log into the VM
# Port 80  — HTTP so browsers can reach your site (redirects to HTTPS)
# Port 443 — HTTPS so browsers get the secure version
#
# Everything else is denied by default — good security posture.

resource "oci_core_security_list" "portfolio_sl" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.portfolio_vcn.id
  display_name   = "${var.project_name}-security-list"

  # ── Ingress Rules (incoming traffic) ───────────────────────

  # SSH — port 22
  # CONCEPT: We allow SSH from anywhere (0.0.0.0/0) for simplicity.
  # In a high-security environment you would restrict this to
  # your home IP only. For a portfolio this is acceptable.
  ingress_security_rules {
    protocol    = "6"         # 6 = TCP
    source      = "0.0.0.0/0" # from anywhere
    description = "Allow SSH"

    tcp_options {
      min = 22
      max = 22
    }
  }

  # HTTP — port 80
  # Nginx listens here and redirects to HTTPS
  ingress_security_rules {
    protocol    = "6"
    source      = "0.0.0.0/0"
    description = "Allow HTTP"

    tcp_options {
      min = 80
      max = 80
    }
  }

  # HTTPS — port 443
  # All real traffic goes here — encrypted with Let's Encrypt cert
  ingress_security_rules {
    protocol    = "6"
    source      = "0.0.0.0/0"
    description = "Allow HTTPS"

    tcp_options {
      min = 443
      max = 443
    }
  }

  # ICMP — allows ping (useful for debugging)
  ingress_security_rules {
    protocol    = "1"         # 1 = ICMP
    source      = "0.0.0.0/0"
    description = "Allow ICMP ping"

    icmp_options {
      type = 3
      code = 4
    }
  }

  # ── Egress Rules (outgoing traffic) ────────────────────────

  # Allow all outgoing traffic
  # CONCEPT: We restrict what comes IN but allow everything OUT.
  # The VM needs to reach the internet to:
  # - Pull Docker images
  # - Call the Resend API
  # - Download Let's Encrypt certificates
  # - Pull updates from GitHub
  egress_security_rules {
    protocol    = "all"
    destination = "0.0.0.0/0"
    description = "Allow all outbound traffic"
  }

  freeform_tags = {
    "project" = var.project_name
  }
}