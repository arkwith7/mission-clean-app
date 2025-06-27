#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Configuration ---
# Your domain names
domains=(aircleankorea.com www.aircleankorea.com)
# Your email for Let's Encrypt
email="admin@aircleankorea.com"

# --- Initial Setup ---
echo "### Stopping any running containers... ###"
docker-compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true

echo "### Preparing Certbot... ###"
# Create a dummy certificate to allow Nginx to start
mkdir -p ./certbot/conf
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "./certbot/conf/options-ssl-nginx.conf"
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "./certbot/conf/ssl-dhparams.pem"
./scripts/dummy_cert.sh "${domains[@]}"

echo "### Starting Nginx for the first time... ###"
# Start Nginx using the dummy certificate
docker-compose -f docker-compose.prod.yml up --force-recreate -d nginx

echo "### Deleting dummy certificate... ###"
# Delete the dummy certificate
./scripts/delete_dummy_cert.sh "${domains[@]}"

echo "### Requesting Let's Encrypt certificate... ###"
# Request the real certificate from Let's Encrypt
docker-compose -f docker-compose.prod.yml run --rm certbot certonly --webroot --webroot-path /var/www/certbot --email $email --agree-tos --no-eff-email -d "${domains[0]}" -d "${domains[1]}"

echo "### Restarting Nginx with real certificate... ###"
# Stop Nginx
docker-compose -f docker-compose.prod.yml stop nginx
# Recreate Nginx container to load the real certificate
docker-compose -f docker-compose.prod.yml up --force-recreate -d nginx

echo "### Starting all services... ###"
# Start all services
docker-compose -f docker-compose.prod.yml up --build -d --remove-orphans

echo "### Deployment successful! ###"
echo "Your services are running at https://${domains[0]}" 