#!/bin/bash

# aircleankorea.com 빠른 배포 스크립트
echo "🚀 aircleankorea.com 배포를 시작합니다..."

# 기본 도메인 설정
export DOMAIN=aircleankorea.com

# 이메일 입력 요청
if [ -z "$EMAIL" ]; then
    echo "📧 Let's Encrypt 인증서 발급을 위한 이메일 주소를 입력해주세요:"
    read -p "이메일: " EMAIL
    export EMAIL
fi

echo "📋 도메인: $DOMAIN"
echo "📧 이메일: $EMAIL"

# 기존 컨테이너 정리
echo "🧹 기존 컨테이너를 정리합니다..."
docker-compose down 2>/dev/null || true

# 필요한 디렉토리 생성
mkdir -p certbot/conf certbot/www

# Docker 이미지 빌드
echo "🔨 Docker 이미지를 빌드합니다..."
docker-compose build

# HTTP로 먼저 시작 (SSL 인증서 획득을 위해)
echo "🌐 HTTP 모드로 서비스를 시작합니다..."
docker-compose up -d nginx backend frontend

# 잠시 대기 (서비스 시작 완료까지)
echo "⏳ 서비스 시작을 기다립니다..."
sleep 10

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
    echo "📚 API 문서: http://$DOMAIN/api-docs"
fi

# 컨테이너 상태 확인
echo "📊 컨테이너 상태:"
docker-compose ps

echo ""
echo "💡 유용한 명령어:"
echo "  - 로그 확인: docker-compose logs -f"
echo "  - 서비스 재시작: docker-compose restart"
echo "  - 서비스 중지: docker-compose down"
echo "  - SSL 갱신: docker-compose run --rm certbot renew" 