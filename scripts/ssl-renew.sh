#!/bin/bash

# Mission Clean SSL 인증서 자동 갱신 스크립트
# Cron job으로 실행되도록 설계됨

set -e

# 현재 시간 로깅
echo "[$(date '+%Y-%m-%d %H:%M:%S')] SSL 인증서 갱신을 시작합니다..."

# 스크립트가 위치한 디렉토리의 상위 디렉토리로 이동 (프로젝트 루트)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 프로젝트 루트: $PROJECT_ROOT"

# docker-compose.prod.yml 파일 확인
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ docker-compose.prod.yml 파일을 찾을 수 없습니다."
    exit 1
fi

# 환경 변수 로드
if [ -f "env.production" ]; then
    source env.production
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ env.production 파일 로드됨"
elif [ -f ".env" ]; then
    source .env
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ .env 파일 로드됨"
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ 환경 설정 파일을 찾을 수 없습니다."
fi

# Certbot으로 인증서 갱신 시도
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 인증서 갱신을 시도합니다..."

if docker-compose -f docker-compose.prod.yml run --rm certbot renew --quiet; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ SSL 인증서 갱신이 완료되었습니다."
    
    # Nginx 설정 다시 로드
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Nginx 설정을 다시 로드합니다..."
    if docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Nginx 설정 다시 로드 완료"
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ Nginx 다시 로드 실패, 전체 서비스 재시작..."
        docker-compose -f docker-compose.prod.yml restart nginx
    fi
    
    # 인증서 만료일 확인
    if command -v openssl &> /dev/null; then
        expiry_date=$(docker-compose -f docker-compose.prod.yml exec certbot openssl x509 -in /etc/letsencrypt/live/aircleankorea.com/cert.pem -noout -dates | grep notAfter | cut -d= -f2)
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] 📅 인증서 만료일: $expiry_date"
    fi
    
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ SSL 인증서 갱신에 실패했습니다."
    exit 1
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🎯 SSL 인증서 갱신 프로세스 완료" 