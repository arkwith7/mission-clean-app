#!/bin/bash

set -e

echo "🔧 === SSL 인증서 문제 해결 스크립트 ==="
echo ""

# 1. 현재 상태 확인
echo "🔍 [1/6] 현재 상태 확인..."
echo "DNS 확인: aircleankorea.com → $(dig +short aircleankorea.com)"
echo "현재 서버 IP: $(curl -s ifconfig.me)"
echo ""

# 2. 필요한 디렉토리 생성
echo "📁 [2/6] 디렉토리 구조 생성..."
mkdir -p nginx/conf.d nginx/logs certbot/conf certbot/www
echo "✅ 디렉토리 생성 완료"
echo ""

# 3. nginx 설정 파일 확인
echo "⚙️  [3/6] Nginx 설정 확인..."
if [ ! -f "nginx/conf.d/default.conf" ]; then
    echo "❌ default.conf가 없습니다. 위의 아티팩트에서 복사하세요."
    echo "또는 임시 설정을 생성합니다..."
    
    cat > nginx/conf.d/default.conf << 'EOF'
server {
    listen 80;
    server_name aircleankorea.com www.aircleankorea.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        try_files $uri =404;
    }
    
    location / {
        proxy_pass http://mission-clean-frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/ {
        proxy_pass http://mission-clean-backend:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
    echo "✅ 임시 nginx 설정 생성"
fi

if [ ! -f "nginx/nginx.conf" ]; then
    echo "❌ nginx.conf가 없습니다. 기본 설정을 생성합니다..."
    cat > nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    sendfile on;
    keepalive_timeout 65;
    
    include /etc/nginx/conf.d/*.conf;
}
EOF
    echo "✅ 기본 nginx.conf 생성"
fi
echo ""

# 4. 컨테이너 재시작 (HTTP만)
echo "🔄 [4/6] HTTP 전용으로 서비스 재시작..."
docker-compose -f docker-compose.prod.yml down nginx 2>/dev/null || true
docker-compose -f docker-compose.prod.yml up -d backend frontend
sleep 5

# nginx만 별도로 시작
docker-compose -f docker-compose.prod.yml up -d nginx
sleep 10
echo ""

# 5. HTTP 접근 테스트
echo "🌐 [5/6] HTTP 접근 테스트..."
echo "내부 테스트:"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:80 | grep -q "200\|301\|302"; then
    echo "✅ 내부 HTTP 접근 성공"
else
    echo "❌ 내부 HTTP 접근 실패"
    echo "nginx 로그 확인:"
    docker-compose -f docker-compose.prod.yml logs nginx --tail=10
fi

echo ""
echo "외부 테스트 (타임아웃 10초):"
if timeout 10 curl -s -o /dev/null -w "%{http_code}" http://aircleankorea.com | grep -q "200\|301\|302"; then
    echo "✅ 외부 HTTP 접근 성공"
    EXTERNAL_ACCESS=true
else
    echo "❌ 외부 HTTP 접근 실패"
    echo ""
    echo "🚨 외부 접근이 안 되는 경우 해결 방법:"
    echo "1. AWS 보안 그룹에서 포트 80, 443 열기"
    echo "2. 도메인 DNS가 현재 서버 IP($(curl -s ifconfig.me))를 가리키는지 확인"
    echo "3. 방화벽 설정 확인"
    EXTERNAL_ACCESS=false
fi
echo ""

# 6. SSL 인증서 발급 시도
if [ "$EXTERNAL_ACCESS" = "true" ]; then
    echo "🔐 [6/6] SSL 인증서 발급 시도..."
    
    # certbot 파일 준비
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "certbot/conf/options-ssl-nginx.conf"
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "certbot/conf/ssl-dhparams.pem"
    
    # 기존 인증서 확인
    if docker run --rm -v mission-clean-app_certbot-conf:/etc/letsencrypt alpine ls /etc/letsencrypt/live/aircleankorea.com/fullchain.pem 2>/dev/null; then
        echo "✅ 기존 인증서가 있습니다. 갱신을 시도합니다..."
        docker-compose -f docker-compose.prod.yml run --rm certbot renew
    else
        echo "🆕 새 인증서 발급 시도..."
        docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
            --webroot \
            --webroot-path /var/www/certbot \
            --email admin@aircleankorea.com \
            --agree-tos \
            --no-eff-email \
            -d aircleankorea.com \
            -d www.aircleankorea.com
    fi
    
    if [ $? -eq 0 ]; then
        echo "✅ SSL 인증서 발급/갱신 성공!"
        echo ""
        echo "🔄 HTTPS 설정으로 nginx 재시작..."
        
        # HTTPS 설정이 포함된 nginx 설정으로 업데이트
        echo "nginx 설정을 HTTPS 지원으로 업데이트하세요 (위의 default.conf 아티팩트 참조)"
        
        docker-compose -f docker-compose.prod.yml restart nginx
        
        echo ""
        echo "🎉 SSL 설정 완료!"
        echo "🌐 https://aircleankorea.com 에서 확인하세요"
    else
        echo "❌ SSL 인증서 발급 실패"
        echo "로그 확인: docker-compose -f docker-compose.prod.yml logs certbot"
    fi
else
    echo "⏭️  [6/6] 외부 접근이 안 되므로 SSL 발급을 건너뜁니다"
    echo ""
    echo "🛠️  임시 해결책:"
    echo "1. 내부 HTTP로 먼저 테스트: http://localhost:80"
    echo "2. AWS 보안 그룹 설정 후 다시 실행"
fi

echo ""
echo "🏁 === 완료 ==="
echo "📊 현재 상태 확인: docker-compose -f docker-compose.prod.yml ps"
echo "📝 로그 확인: docker-compose -f docker-compose.prod.yml logs -f"