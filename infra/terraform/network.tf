# network.tf — Virtual Cloud Network and Networking Resources
#
# CONCEPT: In OCI (and all clouds), you do not put VMs directly
# on the internet. You create a private network (VCN) first,
# then put subnets inside it, then put VMs inside subnets.
#
# The path for internet traffic:
# Internet → Internet Gateway → Route Table → Subnet → VM
#
# VCN = your private network (like your home router network)
# Subnet = a segment of that network
# Internet Gateway = the door to the public internet
# Route Table = the signpost telling traffic where to go

# ── Virtual Cloud Network ─────────────────────────────────────
resource "oci_core_vcn" "portfolio_vcn" {
  compartment_id = var.compartment_ocid
  cidr_block     = "10.0.0.0/16"
  # 10.0.0.0/16 gives us 65,536 private IP addresses
  # More than enough — we only need one VM

  display_name = "${var.project_name}-vcn"
  dns_label    = "portfoliovcn"
  # dns_label must be alphanumeric only — no hyphens

  freeform_tags = {
    "project" = var.project_name
  }
}

# ── Internet Gateway ──────────────────────────────────────────
# CONCEPT: Without this, the VCN is completely isolated.
# The internet gateway is what allows traffic between
# your VCN and the public internet.
resource "oci_core_internet_gateway" "portfolio_igw" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.portfolio_vcn.id
  enabled        = true
  display_name   = "${var.project_name}-igw"

  freeform_tags = {
    "project" = var.project_name
  }
}

# ── Route Table ───────────────────────────────────────────────
# CONCEPT: A route table is like a signpost.
# It says: "traffic going to 0.0.0.0/0 (anywhere on the internet)
# should go through the internet gateway".
# Without this, the VM cannot reach the internet even with an IGW.
resource "oci_core_route_table" "portfolio_rt" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.portfolio_vcn.id
  display_name   = "${var.project_name}-route-table"

  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_internet_gateway.portfolio_igw.id
  }

  freeform_tags = {
    "project" = var.project_name
  }
}

# ── Public Subnet ─────────────────────────────────────────────
# CONCEPT: A subnet is a range of IP addresses within your VCN.
# "Public" means instances here CAN get public IP addresses.
# "Private" would mean they cannot — only reachable internally.
# Our VM needs a public IP so the internet can reach it.
resource "oci_core_subnet" "portfolio_subnet" {
  compartment_id    = var.compartment_ocid
  vcn_id            = oci_core_vcn.portfolio_vcn.id
  cidr_block        = "10.0.1.0/24"
  # 10.0.1.0/24 gives 256 addresses within the VCN
  # Our VM gets one of these (e.g. 10.0.1.10) as its private IP

  display_name      = "${var.project_name}-subnet"
  dns_label         = "portfoliosub"
  route_table_id    = oci_core_route_table.portfolio_rt.id
  security_list_ids = [oci_core_security_list.portfolio_sl.id]
  # We reference the security list from security.tf
  # Terraform resolves dependencies automatically

  prohibit_public_ip_on_vnic = false
  # false = allow public IPs on this subnet (it is public)

  freeform_tags = {
    "project" = var.project_name
  }
}