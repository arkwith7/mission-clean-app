# 📜 Scripts Directory

Mission Clean 프로젝트의 운영 및 관리를 위한 스크립트 모음입니다.

## 🚀 배포 스크립트

**주 배포 스크립트는 프로젝트 루트의 `deploy.sh`를 사용하세요:**
```bash
# 운영환경 배포
./deploy.sh
```

## 🔧 SSL 인증서 관리 스크립트

### `dummy_cert.sh`
**임시 SSL 인증서 생성** (deploy.sh에서 자동 호출)
- Let's Encrypt 인증서 발급 전 Nginx 시작용

### `delete_dummy_cert.sh`
**임시 SSL 인증서 삭제** (deploy.sh에서 자동 호출)
- 실제 SSL 인증서 발급 전 정리

## 🔧 유지보수 스크립트

### `backup.sh`
**데이터베이스 및 SSL 인증서 백업**
- SQLite 데이터베이스 백업
- SSL 인증서 백업
- 7일 이상된 백업 파일 자동 삭제

```bash
# 사용법
./scripts/backup.sh
```

### `ssl-renew.sh`
**SSL 인증서 자동 갱신**
- Let's Encrypt 인증서 갱신
- Nginx 리로드 자동 실행
- Cron 작업에 등록하여 자동화 가능

```bash
# 사용법
./scripts/ssl-renew.sh

# Cron 등록 (매월 1일 새벽 2시)
0 2 1 * * /path/to/scripts/ssl-renew.sh >> /var/log/ssl-renew.log 2>&1
```

## 📋 일반적인 워크플로우

1. **초기 배포**: `./deploy.sh` (프로젝트 루트)
2. **정기 백업**: `./scripts/backup.sh` (주간 실행 권장)
3. **SSL 갱신**: `./scripts/ssl-renew.sh` (월간 자동 실행)

## 🔍 디버깅

각 스크립트는 상세한 로그를 출력하므로 문제 발생 시 출력 메시지를 확인하세요.

```bash
# Docker 로그 확인
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
``` 