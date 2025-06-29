#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "🚀 ========================================="
echo "⚡ Mission Clean App - 빠른 재배포"
echo "========================================="
echo "📝 용도: 소스코드 변경 후 빠른 재배포"
echo "⏱️  예상 시간: 2-3분 (nginx 건드리지 않음)"
echo "========================================="
echo ""

# 환경변수 파일 확인
if [ ! -f "env.production" ]; then
    echo "❌ ERROR: env.production 파일이 없습니다!"
    echo "전체 배포를 먼저 실행하세요: ./deploy.sh"
    exit 1
fi

# 간단한 헬스체크 함수
wait_for_service() {
    local service_name=$1
    local container_name=$2
    local max_attempts=20
    local attempt=0
    
    echo "🔍 $service_name 대기 중..."
    
    while [ $attempt -lt $max_attempts ]; do
        if docker ps --format "table {{.Names}}" | grep -q "^$container_name$"; then
            if docker inspect --format='{{.State.Status}}' "$container_name" 2>/dev/null | grep -q "running"; then
                echo "✅ $service_name 시작 완료!"
                return 0
            fi
        fi
        
        attempt=$((attempt + 1))
        echo "⏳ $service_name 대기 중... ($attempt/$max_attempts)"
        sleep 3
    done
    
    echo "❌ $service_name 시작 실패!"
    return 1
}

echo "🛑 [1단계] 백엔드 서비스 중지 중..."
docker-compose -f docker-compose.prod.yml stop backend 2>/dev/null || true

echo "🧹 [2단계] 기존 백엔드 이미지 정리 중..."
docker images | grep "mission-clean.*backend" | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true

echo "🖥️  [3단계] 백엔드 재빌드 및 시작 중..."
docker-compose -f docker-compose.prod.yml up --build -d backend
wait_for_service "백엔드" "mission-clean-backend" || exit 1

echo "🛑 [4단계] 프론트엔드 서비스 중지 중..."
docker-compose -f docker-compose.prod.yml stop frontend 2>/dev/null || true

echo "🧹 [5단계] 기존 프론트엔드 이미지 정리 중..."
docker images | grep "mission-clean.*frontend" | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true

echo "🌐 [6단계] 프론트엔드 재빌드 및 시작 중..."
docker-compose -f docker-compose.prod.yml up --build -d frontend
wait_for_service "프론트엔드" "mission-clean-frontend" || exit 1

echo "⏳ [7단계] 서비스 안정화 대기 중... (10초)"
sleep 10

echo ""
echo "🔍 [8단계] 서비스 상태 확인 중..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker-compose -f docker-compose.prod.yml ps
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 간단한 접속 테스트
echo ""
echo "🧪 [9단계] 간단한 접속 테스트 중..."
echo "⏳ 백엔드 API 테스트..."
if curl -s --max-time 10 -f http://localhost:3001/health >/dev/null 2>&1; then
    echo "✅ 백엔드 API 응답 정상"
else
    echo "⚠️  백엔드 API 응답 확인 필요 (nginx 경유 테스트 권장)"
fi

echo ""
echo "🎉 ========================================="
echo "✅ 빠른 재배포가 완료되었습니다!"
echo "========================================="
echo "🌐 웹사이트: https://aircleankorea.com"
echo "🔗 관리자: https://aircleankorea.com/admin"
echo "📊 API 문서: https://aircleankorea.com/api-docs"
echo ""
echo "💡 참고사항:"
echo "- nginx는 건드리지 않았습니다"
echo "- nginx에 문제가 있다면 다음 명령 실행:"
echo "  docker-compose -f docker-compose.prod.yml restart nginx"
echo ""
echo "🔍 실시간 로그 확인:"
echo "docker-compose -f docker-compose.prod.yml logs -f backend frontend"
echo ""
echo "🛠️  문제 발생 시:"
echo "docker-compose -f docker-compose.prod.yml restart backend"
echo "docker-compose -f docker-compose.prod.yml restart frontend"
echo ""
echo "📊 전체 시스템 모니터링:"
echo "./manage.sh realtime"
echo "=========================================" 