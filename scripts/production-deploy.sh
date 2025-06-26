#!/bin/bash

# Mission Clean 프로덕션 배포 스크립트
# 도메인: aircleankorea.com
# HTTPS 지원

set -e

echo "🚀 Mission Clean 프로덕션 배포를 시작합니다..."
echo "🌐 도메인: aircleankorea.com"

# 스크립트가 위치한 디렉토리의 상위 디렉토리로 이동 (프로젝트 루트)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "📍 프로젝트 루트: $PROJECT_ROOT"

# 필수 파일 확인
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ docker-compose.prod.yml 파일을 찾을 수 없습니다."
    exit 1
fi

# .env 파일 확인 및 생성
if [ ! -f ".env" ]; then
    echo "⚠️ .env 파일을 찾을 수 없습니다."
    if [ -f "env.example" ]; then
        echo "📄 env.example을 .env로 복사합니다..."
        cp env.example .env
        echo "⚠️ .env 파일을 생성했습니다. 실제 값들로 수정해주세요:"
        echo "   - JWT_SECRET: 강력한 비밀키로 변경"
        echo "   - EMAIL: 실제 이메일 주소로 변경"
        echo "   - 기타 필요한 설정들 확인"
        read -p "계속하시겠습니까? (y/N): " confirm
        if [[ $confirm != [yY] ]]; then
            echo "❌ 배포가 취소되었습니다."
            exit 1
        fi
    else
        echo "❌ env.example 파일도 찾을 수 없습니다."
        exit 1
    fi
fi

# 환경 변수 로드
source .env

# 필수 환경 변수 검증
echo "🔍 환경 변수를 검증합니다..."

# JWT_SECRET 검증
if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "your-super-secret-jwt-key-change-this-in-production-at-least-32-characters-long" ]; then
    echo "❌ JWT_SECRET이 설정되지 않았거나 기본값입니다."
    echo "💡 강력한 JWT_SECRET을 생성하려면:"
    echo "   openssl rand -base64 48"
    exit 1
fi

# JWT_SECRET 길이 검증 (최소 32자)
if [ ${#JWT_SECRET} -lt 32 ]; then
    echo "❌ JWT_SECRET이 너무 짧습니다. 최소 32자 이상이어야 합니다."
    exit 1
fi

# 이메일 설정 확인
if [ "$EMAIL" = "your-email@example.com" ] || [ -z "$EMAIL" ]; then
    echo "📧 SSL 인증서 발급을 위한 이메일 주소를 입력해주세요:"
    read -p "이메일: " USER_EMAIL
    # .env 파일의 EMAIL 값 업데이트
    sed -i "s/EMAIL=.*/EMAIL=$USER_EMAIL/" .env
    export EMAIL=$USER_EMAIL
fi

echo "✅ 환경 변수 검증 완료"
echo "📧 이메일: $EMAIL"
echo "🔐 JWT_SECRET: ****${JWT_SECRET: -4}"

# 필요한 디렉토리 생성
echo "📁 필요한 디렉토리를 생성합니다..."
mkdir -p nginx/conf.d
mkdir -p nginx/logs
mkdir -p certbot/conf
mkdir -p certbot/www
mkdir -p backups
mkdir -p server/logs

# 권한 설정
chmod 755 nginx/logs
chmod 755 server/logs

# 백업 디렉토리를 gitignore에 추가
if [ ! -f ".gitignore" ] || ! grep -q "backups/" .gitignore; then
    echo "backups/" >> .gitignore
fi
if [ ! -f ".gitignore" ] || ! grep -q "logs/" .gitignore; then
    echo "logs/" >> .gitignore
fi

# 기존 컨테이너 정리
echo "🧹 기존 컨테이너를 정리합니다..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# 사용하지 않는 리소스 정리
echo "🗑️  사용하지 않는 Docker 리소스를 정리합니다..."
docker system prune -f

# Docker 이미지 빌드
echo "🔨 Docker 이미지를 빌드합니다..."
docker-compose -f docker-compose.prod.yml build --no-cache

# 초기 HTTP 모드로 서비스 시작 (SSL 인증서 획득용)
echo "🌐 초기 HTTP 모드로 서비스를 시작합니다..."
docker-compose -f docker-compose.prod.yml up -d backend frontend nginx

# 서비스 시작 대기
echo "⏳ 서비스 시작을 기다립니다..."
sleep 30

# 컨테이너 상태 확인
echo "📊 컨테이너 상태 확인:"
docker-compose -f docker-compose.prod.yml ps

# 백엔드 헬스체크 확인
echo "🔍 백엔드 상태 확인..."
for i in {1..15}; do
    if docker-compose -f docker-compose.prod.yml ps backend | grep -q "Up"; then
        echo "✅ 백엔드가 정상적으로 시작되었습니다."
        # 포트 확인
        sleep 5
        if curl -f http://localhost:3001/health 2>/dev/null; then
            echo "✅ 백엔드 API가 응답합니다."
            break
        else
            echo "⚠️ 백엔드는 실행 중이지만 API 응답이 없습니다. ($i/15)"
        fi
    else
        echo "⏳ 백엔드 시작 대기 중... ($i/15)"
        sleep 10
    fi
    
    if [ $i -eq 15 ]; then
        echo "❌ 백엔드 시작에 문제가 있습니다. 로그를 확인해주세요:"
        docker-compose -f docker-compose.prod.yml logs backend
        echo "🔄 그래도 계속 진행합니다..."
    fi
done

# SSL 인증서 획득
echo "🔒 SSL 인증서를 획득합니다..."
docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
    --webroot \
    -w /var/www/certbot \
    --force-renewal \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d aircleankorea.com \
    -d www.aircleankorea.com

# SSL 인증서 획득 결과 확인
if [ $? -eq 0 ]; then
    echo "✅ SSL 인증서가 성공적으로 획득되었습니다."
    
    # HTTPS 설정으로 전체 서비스 재시작
    echo "🔄 HTTPS 설정으로 전체 서비스를 재시작합니다..."
    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml up -d
    
    # 최종 서비스 확인
    echo "⏳ HTTPS 서비스 시작을 기다립니다..."
    sleep 20
    
    echo "🎉 배포가 완료되었습니다!"
    echo ""
    echo "🌐 서비스 URL:"
    echo "  - 메인 사이트: https://aircleankorea.com"
    echo "  - API 문서: https://aircleankorea.com/api-docs"
    echo "  - API 엔드포인트: https://aircleankorea.com/api/"
    
    # SSL 자동 갱신 cron 설정 안내
    echo ""
    echo "🔧 SSL 자동 갱신 설정:"
    echo "다음 명령어를 실행하여 SSL 인증서 자동 갱신을 설정하세요:"
    echo "crontab -e"
    echo "그리고 다음 라인을 추가하세요:"
    echo "0 2 * * * $PROJECT_ROOT/scripts/ssl-renew.sh >> /var/log/ssl-renew.log 2>&1"
    
else
    echo "❌ SSL 인증서 획득에 실패했습니다."
    echo "HTTP 모드로 서비스가 실행 중입니다."
    echo ""
    echo "🌐 임시 서비스 URL:"
    echo "  - 메인 사이트: http://aircleankorea.com"
    echo "  - API 문서: http://aircleankorea.com/api-docs"
    echo ""
    echo "DNS 설정을 확인하고 다시 시도해주세요."
fi

# 최종 컨테이너 상태
echo ""
echo "📊 최종 컨테이너 상태:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "💡 유용한 명령어:"
echo "  - 전체 로그 확인: docker-compose -f docker-compose.prod.yml logs -f"
echo "  - 특정 서비스 로그: docker-compose -f docker-compose.prod.yml logs -f [backend|frontend|nginx|certbot]"
echo "  - 서비스 재시작: docker-compose -f docker-compose.prod.yml restart"
echo "  - 서비스 중지: docker-compose -f docker-compose.prod.yml down"
echo "  - SSL 수동 갱신: docker-compose -f docker-compose.prod.yml run --rm certbot renew"
echo "  - 백업 실행: ./scripts/backup.sh"
echo ""
echo "🎯 배포 완료!" 