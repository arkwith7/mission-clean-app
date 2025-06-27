#!/bin/bash
set -e

domains=($@)
data_path="./certbot"
rsa_key_size=4096

if [ -d "$data_path/conf/live/${domains[0]}" ]; then
  echo ">>> Existing certificate found for ${domains[0]}. Skipping dummy certificate creation. <<<"
  exit 0
fi

echo "### Creating dummy certificate for ${domains[*]} ... ###"
path="/etc/letsencrypt/live/${domains[0]}"
mkdir -p "$data_path/conf/live/${domains[0]}"

openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 1 \
  -keyout "$data_path/conf/live/${domains[0]}/privkey.pem" \
  -out "$data_path/conf/live/${domains[0]}/fullchain.pem" \
  -subj "/CN=localhost"
echo 