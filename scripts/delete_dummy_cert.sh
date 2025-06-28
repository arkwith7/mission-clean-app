#!/bin/bash
set -e

domains=($@)
data_path="./certbot"

echo "### Deleting dummy certificate for ${domains[*]} ... ###"
rm -Rf "$data_path/conf/live/${domains[0]}"
rm -Rf "$data_path/conf/archive/${domains[0]}"
rm -Rf "$data_path/conf/renewal/${domains[0]}.conf"
echo 