output "droplet_ip" {
  description = "Public IP of the Zuroy droplet"
  value       = digitalocean_droplet.app.ipv4_address
}
