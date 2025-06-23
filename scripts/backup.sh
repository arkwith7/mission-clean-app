#!/bin/bash

# 데이터 백업 스크립트
echo "💾 데이터 백업을 시작합니다..."

# 스크립트가 위치한 디렉토리의 상위 디렉토리로 이동 (프로젝트 루트)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "📍 프로젝트 루트: $PROJECT_ROOT"

# 백업 디렉토리 설정
BACKUP_DIR="$PROJECT_ROOT/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="mission_clean_backup_$DATE.tar.gz"

# 백업 디렉토리 생성
mkdir -p $BACKUP_DIR

# SQLite 데이터베이스 백업
echo "📄 데이터베이스를 백업합니다..."
docker-compose exec backend sqlite3 /app/mission_clean.sqlite ".backup /app/backup_$DATE.sqlite"
docker cp mission-clean-backend:/app/backup_$DATE.sqlite $BACKUP_DIR/

# SSL 인증서 백업
echo "🔒 SSL 인증서를 백업합니다..."
tar -czf $BACKUP_DIR/ssl_certificates_$DATE.tar.gz certbot/conf/

# 전체 백업 파일 생성
echo "📦 전체 백업 파일을 생성합니다..."
tar -czf $BACKUP_DIR/$BACKUP_FILE \
    $BACKUP_DIR/backup_$DATE.sqlite \
    $BACKUP_DIR/ssl_certificates_$DATE.tar.gz \
    --exclude=node_modules \
    --exclude=dist \
    --exclude=build

# 임시 파일 정리
rm -f $BACKUP_DIR/backup_$DATE.sqlite
rm -f $BACKUP_DIR/ssl_certificates_$DATE.tar.gz

# 7일 이상된 백업 파일 삭제
find $BACKUP_DIR -name "mission_clean_backup_*.tar.gz" -mtime +7 -delete

echo "✅ 백업이 완료되었습니다: $BACKUP_DIR/$BACKUP_FILE" 