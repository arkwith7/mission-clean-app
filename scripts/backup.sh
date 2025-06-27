#!/bin/bash

# Mission Clean 데이터 백업 스크립트
# 데이터베이스, 로그, 설정 파일 백업

set -e

# 백업 시작 알림
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🗄️ Mission Clean 백업을 시작합니다..."

# 스크립트가 위치한 디렉토리의 상위 디렉토리로 이동 (프로젝트 루트)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 프로젝트 루트: $PROJECT_ROOT"

# 백업 디렉토리 설정
BACKUP_DATE=$(date '+%Y%m%d_%H%M%S')
BACKUP_DIR="backups/backup_$BACKUP_DATE"
mkdir -p "$BACKUP_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 백업 디렉토리: $BACKUP_DIR"

# 환경 변수 로드 (운영환경 우선)
if [ -f "env.production" ]; then
    source env.production
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ env.production 파일 로드됨"
elif [ -f ".env" ]; then
    source .env
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ .env 파일 로드됨"
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ 환경 설정 파일을 찾을 수 없습니다."
fi

# 데이터베이스 백업
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 📊 데이터베이스 백업 중..."
if [ -f "server/mission_clean.sqlite" ]; then
    cp "server/mission_clean.sqlite" "$BACKUP_DIR/mission_clean.sqlite"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ 데이터베이스 백업 완료"
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ 데이터베이스 파일을 찾을 수 없습니다."
fi

# 설정 파일 백업
echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚙️ 설정 파일 백업 중..."
if [ -f "env.production" ]; then
    cp "env.production" "$BACKUP_DIR/"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ 운영환경 설정 백업 완료"
fi
if [ -f ".env" ]; then
    cp ".env" "$BACKUP_DIR/env_backup"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ 개발환경 설정 백업 완료"
fi

if [ -f "docker-compose.prod.yml" ]; then
    cp "docker-compose.prod.yml" "$BACKUP_DIR/"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Docker Compose 설정 백업 완료"
fi

# Nginx 설정 백업
if [ -d "nginx" ]; then
    cp -r "nginx" "$BACKUP_DIR/"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Nginx 설정 백업 완료"
fi

# 로그 파일 백업 (최근 7일치만)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 📋 로그 파일 백업 중..."
mkdir -p "$BACKUP_DIR/logs"

if [ -d "server/logs" ]; then
    find server/logs -name "*.log" -mtime -7 -exec cp {} "$BACKUP_DIR/logs/" \;
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ 서버 로그 백업 완료"
fi

if [ -d "nginx/logs" ]; then
    find nginx/logs -name "*.log" -mtime -7 -exec cp {} "$BACKUP_DIR/logs/" \;
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Nginx 로그 백업 완료"
fi

# SSL 인증서 백업 (Docker 볼륨에서)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🔒 SSL 인증서 백업 중..."
if docker-compose -f docker-compose.prod.yml ps certbot | grep -q "Up"; then
    docker-compose -f docker-compose.prod.yml exec certbot tar czf /tmp/letsencrypt_backup.tar.gz /etc/letsencrypt 2>/dev/null || true
    docker cp $(docker-compose -f docker-compose.prod.yml ps -q certbot):/tmp/letsencrypt_backup.tar.gz "$BACKUP_DIR/" 2>/dev/null && \
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ SSL 인증서 백업 완료" || \
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ SSL 인증서 백업 실패"
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ Certbot 컨테이너가 실행되지 않습니다."
fi

# 백업 압축
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 📦 백업 파일 압축 중..."
cd backups
tar czf "backup_$BACKUP_DATE.tar.gz" "backup_$BACKUP_DATE"
rm -rf "backup_$BACKUP_DATE"
cd "$PROJECT_ROOT"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ 압축 완료: backups/backup_$BACKUP_DATE.tar.gz"

# 백업 파일 크기 확인
BACKUP_SIZE=$(du -h "backups/backup_$BACKUP_DATE.tar.gz" | cut -f1)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 📏 백업 파일 크기: $BACKUP_SIZE"

# 오래된 백업 파일 정리 (30일 이상)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🧹 오래된 백업 파일 정리 중..."
find backups -name "backup_*.tar.gz" -mtime +30 -delete 2>/dev/null || true

# 남은 백업 파일 개수 확인
BACKUP_COUNT=$(ls -1 backups/backup_*.tar.gz 2>/dev/null | wc -l)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 📁 현재 백업 파일 개수: $BACKUP_COUNT"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🎯 백업이 완료되었습니다!"
echo ""
echo "💡 백업 위치: backups/backup_$BACKUP_DATE.tar.gz"
echo "💡 복원 방법:"
echo "   1. 서비스 중지: docker-compose -f docker-compose.prod.yml down"
echo "   2. 백업 압축 해제: tar xzf backups/backup_$BACKUP_DATE.tar.gz -C backups/"
echo "   3. 데이터베이스 복원: cp backups/backup_$BACKUP_DATE/mission_clean.sqlite server/"
echo "   4. 설정 파일 복원: cp backups/backup_$BACKUP_DATE/env_backup .env"
echo "   5. 서비스 재시작: docker-compose -f docker-compose.prod.yml up -d" 