#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- 환경변수 파일 보안 체크 ---
echo "🔒 [보안 체크] 환경변수 파일 확인 중..."

if [ ! -f "env.production" ]; then
    echo "❌ ERROR: env.production 파일이 없습니다!"
    echo ""
    echo "📋 해결방법:"
    echo "1. cp env.production.example env.production"
    echo "2. vim env.production  # 실제 운영 값으로 수정"
    echo ""
    echo "🔐 중요: 민감한 정보를 포함한 실제 값을 입력하세요:"
    echo "   - JWT_SECRET (32자 이상)"
    echo "   - NCLOUD_ACCESS_KEY"
    echo "   - NCLOUD_SECRET_KEY"
    echo "   - ADMIN_PASSWORD"
    echo ""
    exit 1
fi

# 환경변수 파일에서 필수 설정 확인
source env.production

if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "실제_강력한_JWT_시크릿_키를_여기에_입력_최소_32자이상" ]; then
    echo "❌ ERROR: JWT_SECRET이 설정되지 않았습니다!"
    echo "🔐 env.production 파일에서 강력한 JWT_SECRET을 설정하세요."
    exit 1
fi

if [ "$SMS_ENABLED" = "true" ]; then
    if [ -z "$NCLOUD_ACCESS_KEY" ] || [ "$NCLOUD_ACCESS_KEY" = "실제_네이버클라우드_액세스키" ]; then
        echo "❌ ERROR: NCLOUD_ACCESS_KEY가 설정되지 않았습니다!"
        echo "📱 SMS 기능을 위해 네이버 클라우드 API 키를 설정하세요."
        exit 1
    fi
fi

echo "✅ [보안 체크] 환경변수 파일 확인 완료!"
echo ""

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