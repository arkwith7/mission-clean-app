#!/bin/bash

echo "🔧 배포 환경을 수정합니다..."

# 1. 기존 Nginx 서비스 중지
echo "⏹️  기존 Nginx 서비스를 중지합니다..."
sudo systemctl stop nginx
sudo systemctl disable nginx

# 2. Docker Compose 버전 경고 해결
echo "📝 Docker Compose 버전 설정을 수정합니다..."
cd /home/ubuntu/prod/mission-clean-app
sed -i '/^version:/d' docker-compose.yml

# 3. 필요한 디렉토리 생성
echo "📁 필요한 디렉토리를 생성합니다..."
mkdir -p nginx/conf.d
mkdir -p certbot/conf
mkdir -p certbot/www

# 4. 스크립트 수정 (프로젝트 루트에서 실행되도록)
echo "🔄 배포 스크립트를 수정합니다..."

# 배포 스크립트가 프로젝트 루트에서 실행되도록 수정
cat > deploy-fixed.sh << 'EOF'
#!/bin/bash

# aircleankorea.com 수정된 배포 스크립트
echo "🚀 aircleankorea.com 배포를 시작합니다..."

# 현재 디렉토리 확인
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml 파일을 찾을 수 없습니다. 프로젝트 루트 디렉토리에서 실행해주세요."
    exit 1
fi

# 기본 도메인 설정
export DOMAIN=aircleankorea.com

# 이메일 설정
if [ -z "$EMAIL" ]; then
    export EMAIL=arkwith7@gmail.com
fi

echo "📋 도메인: $DOMAIN"
echo "📧 이메일: $EMAIL"

# 기존 컨테이너 정리
echo "🧹 기존 컨테이너를 정리합니다..."
docker-compose down 2>/dev/null || true

# 필요한 디렉토리 생성
echo "📁 필요한 디렉토리를 생성합니다..."
mkdir -p nginx/conf.d
mkdir -p certbot/conf
mkdir -p certbot/www

# nginx 설정 파일이 있는지 확인하고 없으면 생성
if [ ! -f "nginx/conf.d/default.conf" ]; then
    echo "📝 Nginx 설정 파일을 생성합니다..."
    cat > nginx/conf.d/default.conf << 'NGINX_EOF'
# HTTP에서 HTTPS로 리다이렉트
server {
    listen 80;
    server_name aircleankorea.com www.aircleankorea.com;

    # Let's Encrypt ACME 챌린지
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # 나머지 모든 요청을 HTTPS로 리다이렉트
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS 서버 설정
server {
    listen 443 ssl http2;
    server_name aircleankorea.com www.aircleankorea.com;

    # SSL 인증서 설정
    ssl_certificate /etc/letsencrypt/live/aircleankorea.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/aircleankorea.com/privkey.pem;

    # 보안 헤더
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # API 요청을 백엔드로 프록시
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_redirect off;
    }

    # API 문서 접근
    location /api-docs/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 프론트엔드 요청
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 정적 파일 캐싱
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        proxy_pass http://frontend;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX_EOF
fi

# Docker 이미지 빌드
echo "🔨 Docker 이미지를 빌드합니다..."
docker-compose build

# HTTP로 먼저 시작 (SSL 인증서 획득을 위해)
echo "🌐 HTTP 모드로 서비스를 시작합니다..."
docker-compose up -d backend frontend nginx

# 잠시 대기 (서비스 시작 완료까지)
echo "⏳ 서비스 시작을 기다립니다..."
sleep 15

# 컨테이너 상태 확인
echo "📊 컨테이너 상태 확인:"
docker-compose ps

# Nginx 로그 확인
echo "📋 Nginx 로그:"
docker-compose logs nginx | tail -10

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

# 최종 컨테이너 상태 확인
echo "📊 최종 컨테이너 상태:"
docker-compose ps

echo ""
echo "💡 유용한 명령어:"
echo "  - 로그 확인: docker-compose logs -f"
echo "  - 서비스 재시작: docker-compose restart"
echo "  - 서비스 중지: docker-compose down"
echo "  - SSL 갱신: docker-compose run --rm certbot renew"
EOF

chmod +x deploy-fixed.sh

echo "✅ 환경 수정이 완료되었습니다!"
echo ""
echo "이제 다음 명령으로 배포를 시작하세요:"
echo "cd /home/ubuntu/prod/mission-clean-app"
echo "./deploy-fixed.sh" 