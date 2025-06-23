#!/bin/bash

# SSL 인증서 자동 갱신 스크립트
echo "🔄 SSL 인증서 갱신을 시작합니다..."

# 스크립트가 위치한 디렉토리의 상위 디렉토리로 이동 (프로젝트 루트)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "📍 프로젝트 루트: $PROJECT_ROOT"

# docker-compose.yml 파일이 있는지 확인
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml 파일을 찾을 수 없습니다."
    exit 1
fi

# 인증서 갱신 시도
echo "🔒 인증서 갱신을 시도합니다..."
docker-compose run --rm certbot renew

# 갱신 결과 확인
if [ $? -eq 0 ]; then
    echo "✅ SSL 인증서 갱신이 완료되었습니다. Nginx를 리로드합니다..."
    docker-compose exec nginx nginx -s reload
    
    if [ $? -eq 0 ]; then
        echo "✅ Nginx 리로드가 완료되었습니다."
    else
        echo "⚠️  Nginx 리로드에 실패했습니다. 수동으로 확인해주세요."
    fi
else
    echo "ℹ️  SSL 인증서 갱신이 필요하지 않거나 실패했습니다."
fi

echo "🏁 SSL 인증서 갱신 프로세스가 완료되었습니다." 