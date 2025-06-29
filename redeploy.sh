#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "🚀 ========================================="
echo "⚡ Mission Clean App - 빠른 재배포"
echo "========================================="
echo "📝 용도: 소스코드 변경 후 빠른 재배포"
echo "⏱️  예상 시간: 3-5분 (SSL 설정 생략)"
echo "========================================="
echo ""

# 환경변수 파일 확인
if [ ! -f "env.production" ]; then
    echo "❌ ERROR: env.production 파일이 없습니다!"
    echo "전체 배포를 먼저 실행하세요: ./deploy.sh"
    exit 1
fi

# 헬스체크 함수
check_service_health() {
    local service_name=$1
    local container_name=$2
    local max_attempts=20
    local attempt=0
    
    echo "🔍 $service_name 헬스체크 시작..."
    
    while [ $attempt -lt $max_attempts ]; do
        if docker ps --format "table {{.Names}}" | grep -q "^$container_name$"; then
            container_health=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "no-health-check")
            
            if [ "$container_health" = "healthy" ] || [ "$container_health" = "no-health-check" ]; then
                echo "✅ $service_name 서비스 준비 완료!"
                return 0
            fi
        fi
        
        attempt=$((attempt + 1))
        echo "⏳ $service_name 대기 중... ($attempt/$max_attempts)"
        sleep 3
    done
    
    echo "❌ $service_name 헬스체크 실패!"
    echo "🔍 로그 확인: docker-compose -f docker-compose.prod.yml logs $service_name"
    return 1
}

echo "🛑 [1단계] 애플리케이션 서비스 중지 중..."
# Stop only application services, keep nginx and certbot running
docker-compose -f docker-compose.prod.yml stop backend frontend 2>/dev/null || true

echo "🧹 [2단계] 기존 애플리케이션 이미지 정리 중..."
# Remove old application images to ensure fresh build
docker images | grep -E "mission-clean.*backend|mission-clean.*frontend" | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true

echo "🖥️  [3단계] 백엔드 재빌드 및 시작 중..."
docker-compose -f docker-compose.prod.yml up --build -d backend
check_service_health "백엔드" "mission-clean-backend" || exit 1

echo "🌐 [4단계] 프론트엔드 재빌드 및 시작 중..."
docker-compose -f docker-compose.prod.yml up --build -d frontend
check_service_health "프론트엔드" "mission-clean-frontend" || exit 1

echo "🔄 [5단계] Nginx 설정 새로고침 중..."
# Restart nginx to ensure it picks up new backend/frontend
docker-compose -f docker-compose.prod.yml restart nginx
check_service_health "Nginx" "mission-clean-nginx" || exit 1

echo ""
echo "🔍 [6단계] 서비스 상태 확인 중..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker-compose -f docker-compose.prod.yml ps
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "🎉 ========================================="
echo "✅ 빠른 재배포가 완료되었습니다!"
echo "========================================="
echo "🌐 웹사이트: https://aircleankorea.com"
echo "🔗 관리자: https://aircleankorea.com/admin"
echo "📊 API 문서: https://aircleankorea.com/api-docs"
echo ""
echo "🔍 실시간 로그 확인:"
echo "docker-compose -f docker-compose.prod.yml logs -f backend frontend"
echo ""
echo "🛠️  문제 발생 시:"
echo "docker-compose -f docker-compose.prod.yml restart backend"
echo "docker-compose -f docker-compose.prod.yml restart frontend"
echo "=========================================" 