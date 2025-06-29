#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- 헬스체크 함수들 ---
check_service_health() {
    local service_name=$1
    local container_name=$2
    local max_attempts=30
    local attempt=0
    
    echo "🔍 $service_name 헬스체크 시작..."
    
    while [ $attempt -lt $max_attempts ]; do
        # Check if container is running
        if docker ps --format "table {{.Names}}" | grep -q "^$container_name$"; then
            container_health=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "no-health-check")
            
            if [ "$container_health" = "healthy" ] || [ "$container_health" = "no-health-check" ]; then
                echo "✅ $service_name 서비스 준비 완료!"
                return 0
            fi
        fi
        
        attempt=$((attempt + 1))
        echo "⏳ $service_name 대기 중... ($attempt/$max_attempts)"
        sleep 5
    done
    
    echo "❌ $service_name 헬스체크 실패!"
    echo "🔍 로그 확인: docker-compose -f docker-compose.prod.yml logs $service_name"
    echo "🔍 컨테이너 상태: docker ps -a | grep $container_name"
    return 1
}

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
    echo "   - POSTGRES_PASSWORD (강력한 비밀번호)"
    echo "   - NCLOUD_ACCESS_KEY"
    echo "   - NCLOUD_SECRET_KEY"
    echo ""
    exit 1
fi

# 환경변수 파일에서 필수 설정 확인
source env.production

# JWT 보안 설정 확인
if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "실제_강력한_JWT_시크릿_키를_여기에_입력_최소_32자이상" ]; then
    echo "❌ ERROR: JWT_SECRET이 설정되지 않았습니다!"
    echo "🔐 env.production 파일에서 강력한 JWT_SECRET을 설정하세요."
    exit 1
fi

# PostgreSQL 설정 확인
if [ -z "$POSTGRES_USER" ] || [ -z "$POSTGRES_PASSWORD" ] || [ -z "$POSTGRES_DB" ]; then
    echo "❌ ERROR: PostgreSQL 환경변수가 설정되지 않았습니다!"
    echo "🗄️  env.production 파일에서 다음 값들을 설정하세요:"
    echo "   - POSTGRES_USER"
    echo "   - POSTGRES_PASSWORD"
    echo "   - POSTGRES_DB"
    exit 1
fi

# 데이터베이스 연결 설정 확인
if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
    echo "❌ ERROR: 백엔드 데이터베이스 연결 설정이 없습니다!"
    echo "🔌 env.production 파일에서 다음 값들을 설정하세요:"
    echo "   - DB_HOST"
    echo "   - DB_USER"
    echo "   - DB_PASSWORD"
    echo "   - DB_NAME"
    exit 1
fi

# SMS 설정 확인 (활성화된 경우)
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
echo "🛑 [단계 1] 기존 컨테이너 및 이미지 정리 중..."
docker-compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true

echo "🧹 [단계 1-1] 사용하지 않는 Docker 이미지 정리 중..."
# Remove dangling images (untagged images)
docker image prune -f 2>/dev/null || true
# Remove unused images for mission-clean project specifically
docker images | grep -E "mission-clean|<none>" | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true
echo "✅ Docker 이미지 정리 완료"

echo "🔧 [단계 2] SSL 인증서 환경 준비 중..."
# Create a dummy certificate to allow Nginx to start
mkdir -p ./certbot/conf ./certbot/www
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "./certbot/conf/options-ssl-nginx.conf"
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "./certbot/conf/ssl-dhparams.pem"
./scripts/dummy_cert.sh "${domains[@]}"

echo "🗄️  [단계 3] 데이터베이스 시작 중..."
# Start database first (PostgreSQL은 이미지라서 빌드 불필요)
docker-compose -f docker-compose.prod.yml up -d db
check_service_health "데이터베이스" "mission-clean-postgres" || exit 1

echo "🖥️  [단계 4] 백엔드 서비스 빌드 및 시작 중..."
# Build and start backend after database is ready
docker-compose -f docker-compose.prod.yml up --build -d backend
check_service_health "백엔드" "mission-clean-backend" || exit 1

echo "🌐 [단계 5] 프론트엔드 서비스 빌드 및 시작 중..."
# Build and start frontend after backend is ready
docker-compose -f docker-compose.prod.yml up --build -d frontend
check_service_health "프론트엔드" "mission-clean-frontend" || exit 1

echo "🔒 [단계 6] Nginx 임시 시작 (SSL 인증서 발급용)..."
# Start Nginx with dummy certificate
docker-compose -f docker-compose.prod.yml up -d nginx
check_service_health "Nginx" "mission-clean-nginx" || exit 1

echo "🗑️  [단계 7] 임시 인증서 삭제 중..."
# Delete the dummy certificate
./scripts/delete_dummy_cert.sh "${domains[@]}"

echo "🛡️  [단계 8] Let's Encrypt 실제 인증서 발급 중..."
# Request the real certificate from Let's Encrypt
docker-compose -f docker-compose.prod.yml run --rm certbot certonly --webroot --webroot-path /var/www/certbot --email $email --agree-tos --no-eff-email -d "${domains[0]}" -d "${domains[1]}"

echo "🔄 [단계 9] 실제 인증서로 Nginx 재시작 중..."
# Stop Nginx
docker-compose -f docker-compose.prod.yml stop nginx
# Recreate Nginx container to load the real certificate
docker-compose -f docker-compose.prod.yml up --force-recreate -d nginx
check_service_health "Nginx(SSL적용)" "mission-clean-nginx" || exit 1

echo "🚀 [단계 10] 전체 서비스 최종 시작 중..."
# Start all services (including certbot) with build
docker-compose -f docker-compose.prod.yml up --build -d

echo ""
echo "🔍 [단계 11] 최종 서비스 상태 확인 중..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker-compose -f docker-compose.prod.yml ps
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "🎉 ========================================="
echo "✅ 배포가 성공적으로 완료되었습니다!"
echo "========================================="
echo "🌐 웹사이트: https://${domains[0]}"
echo "🔗 관리자: https://${domains[0]}/admin"
echo "📊 API 문서: https://${domains[0]}/api-docs"
echo ""
echo "🔍 실시간 상태 확인:"
echo "docker-compose -f docker-compose.prod.yml ps"
echo ""
echo "📋 실시간 로그 확인:"
echo "docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🛠️  문제 해결 명령어:"
echo "docker-compose -f docker-compose.prod.yml restart [서비스명]"
echo "docker-compose -f docker-compose.prod.yml logs [서비스명]"
echo "=========================================" 