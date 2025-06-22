#!/bin/bash

# 배포 스크립트
echo "🚀 Mission Clean 앱 배포를 시작합니다..."

# 환경 변수 확인
if [ -z "$DOMAIN" ]; then
    echo "❌ DOMAIN 환경 변수가 설정되지 않았습니다."
    echo "예: export DOMAIN=your-domain.com"
    exit 1
fi

if [ -z "$EMAIL" ]; then
    echo "❌ EMAIL 환경 변수가 설정되지 않았습니다."
    echo "예: export EMAIL=your-email@example.com"
    exit 1
fi

echo "📋 도메인: $DOMAIN"
echo "📧 이메일: $EMAIL"

# 기존 컨테이너 정리
echo "🧹 기존 컨테이너를 정리합니다..."
docker-compose down

# Nginx 설정에서 도메인 업데이트
echo "⚙️  Nginx 설정을 업데이트합니다..."
sed -i "s/aircleankorea.com/$DOMAIN/g" nginx/conf.d/default.conf
sed -i "s/your-email@example.com/$EMAIL/g" docker-compose.yml

# 필요한 디렉토리 생성
mkdir -p certbot/conf certbot/www

# Docker 이미지 빌드
echo "🔨 Docker 이미지를 빌드합니다..."
docker-compose build

# HTTP로 먼저 시작 (SSL 인증서 획득을 위해)
echo "🌐 HTTP 모드로 서비스를 시작합니다..."
docker-compose up -d nginx backend frontend

# SSL 인증서 획득
echo "🔒 SSL 인증서를 획득합니다..."
docker-compose run --rm certbot certonly --webroot -w /var/www/certbot --force-renewal --email $EMAIL --agree-tos --no-eff-email -d $DOMAIN -d www.$DOMAIN

# SSL 인증서 획득 확인
if [ $? -eq 0 ]; then
    echo "✅ SSL 인증서가 성공적으로 획득되었습니다."
    
    # HTTPS 설정으로 Nginx 재시작
    echo "🔄 HTTPS 설정으로 서비스를 재시작합니다..."
    docker-compose down
    docker-compose up -d
    
    echo "🎉 배포가 완료되었습니다!"
    echo "🌐 웹사이트: https://$DOMAIN"
    echo "📚 API 문서: https://$DOMAIN/api-docs"
else
    echo "❌ SSL 인증서 획득에 실패했습니다. HTTP 모드로 계속 실행합니다."
    echo "🌐 웹사이트: http://$DOMAIN"
fi

# 컨테이너 상태 확인
echo "📊 컨테이너 상태:"
docker-compose ps 