# Mission Clean 앱 프로덕션 배포 가이드

이 가이드는 Mission Clean 애플리케이션을 aircleankorea.com 도메인으로 HTTPS와 함께 프로덕션 서버에 배포하는 방법을 설명합니다.

## 시스템 요구사항

- Docker Engine 20.10+
- Docker Compose 2.0+
- 도메인 이름 (aircleankorea.com이 서버 IP로 DNS 설정되어 있어야 함)
- 80, 443 포트가 열려있는 서버
- 최소 2GB RAM, 10GB 디스크 공간

## 컨테이너 구성

1. **Backend**: Node.js Express API 서버 (포트 3001)
2. **Frontend**: React 애플리케이션 (Nginx로 서빙)
3. **Nginx**: 리버스 프록시 및 HTTPS 터미네이션
4. **Certbot**: Let's Encrypt SSL 인증서 자동 관리

## 📁 **프로젝트 구조 (배포 관련)**

**✨ 2024년 업데이트**: 배포 관련 파일들이 정리되고 개선되었습니다.

```
📁 mission-clean-app/
├── 🐳 docker-compose.yml          # 메인 프로덕션 구성 (헬스체크, 로깅 포함)
├── 🐳 docker-compose.prod.yml     # 프로덕션 리소스 제한 설정
├── ⚙️ .env                        # 환경 변수 (env.example에서 복사)
├── 📜 scripts/
│   ├── 🚀 production-deploy.sh    # ⭐ 새로운 통합 배포 스크립트
│   ├── 🔒 ssl-renew.sh           # ⭐ 개선된 SSL 갱신 (자동 경로 감지)
│   ├── 💾 backup.sh              # ⭐ 개선된 백업 (프로젝트 기반)
│   ├── 📦 deploy.sh              # 기존 일반 배포 스크립트
│   ├── ⚡ quick-deploy.sh         # 빠른 배포 스크립트
│   └── 🔧 fix-deployment.sh      # 배포 문제 해결 스크립트
├── 🌐 nginx/
│   ├── nginx.conf                # 메인 Nginx 설정
│   └── conf.d/default.conf       # aircleankorea.com 가상호스트
├── 📚 docs/
│   └── README-deployment.md      # 이 문서
├── 📁 backups/                   # 자동 백업 저장소 (gitignore됨)
└── 📁 certbot/                   # SSL 인증서 저장소 (gitignore됨)
```

### 🔥 **주요 변경사항**
- ✅ **불필요한 파일 제거**: `docker-compose-fixed.yml`, `nginx-fixed.conf` 삭제
- ✅ **스크립트 개선**: 모든 스크립트에 자동 경로 감지 기능 추가
- ✅ **Docker 구성 최적화**: 헬스체크, 로깅, 의존성 관리 개선
- ✅ **보안 강화**: .gitignore에 민감한 디렉토리 추가

## 📋 **배포 전 준비사항**

### 1. 서버 준비

```bash
# Docker 설치 (Ubuntu/Debian)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. DNS 설정 확인

aircleankorea.com과 www.aircleankorea.com이 서버 IP로 올바르게 설정되어 있는지 확인:

```bash
nslookup aircleankorea.com
nslookup www.aircleankorea.com
```

### 3. 프로젝트 클론 및 설정

```bash
git clone <repository-url> mission-clean-app
cd mission-clean-app

# .env 파일이 있는지 확인
ls -la .env
```

## 🚀 **간편 배포 (권장)**

### 🎯 **새로운 통합 배포 스크립트**

**✨ 2024년 업데이트**: 모든 배포 과정을 자동화한 새로운 `production-deploy.sh` 스크립트를 제공합니다.

```bash
# 프로덕션 배포 스크립트 실행
./scripts/production-deploy.sh
```

#### **🔥 주요 특징:**
- 🧠 **자동 경로 감지**: 스크립트 위치를 자동으로 감지하여 어디서든 실행 가능
- 📧 **이메일 자동 설정**: .env 파일에서 이메일이 기본값이면 자동으로 입력 요청
- 🔄 **헬스체크 내장**: 백엔드 서비스 정상 동작 확인 후 진행
- 🛡️ **에러 처리**: 각 단계별 실패 시 명확한 에러 메시지 제공
- 📊 **상태 모니터링**: 실시간 컨테이너 상태 및 로그 확인

#### **자동 수행 작업:**
- ✅ **환경 설정 검증**: .env 파일 존재 및 필수 설정 확인
- ✅ **SSL 인증서 이메일 설정**: 실제 이메일 주소 자동 설정
- ✅ **리소스 정리**: 기존 컨테이너 및 사용하지 않는 Docker 리소스 정리
- ✅ **Docker 이미지 빌드**: --no-cache 옵션으로 깨끗한 빌드
- ✅ **HTTP 초기 시작**: SSL 인증서 획득을 위한 임시 HTTP 서비스
- ✅ **백엔드 헬스체크**: 서비스 정상 동작 확인 (최대 5회 재시도)
- ✅ **SSL 인증서 자동 획득**: Let's Encrypt 인증서 자동 발급
- ✅ **HTTPS 전환**: SSL 인증서 적용 후 HTTPS 모드로 재시작
- ✅ **최종 상태 확인**: 모든 서비스 정상 동작 확인
- ✅ **관리 명령어 안내**: 향후 관리에 필요한 명령어 가이드 제공

## 🔧 **수동 배포 (고급 사용자)**

### 1. 환경 변수 설정

`.env` 파일을 편집하여 이메일 주소를 설정:

```bash
# .env 파일 편집
nano .env

# EMAIL을 실제 이메일 주소로 변경
EMAIL=your-actual-email@example.com
```

### 2. 단계별 수동 배포

```bash
# 1. 필요한 디렉토리 생성
mkdir -p nginx/conf.d certbot/conf certbot/www backups

# 2. Docker 이미지 빌드
docker-compose build --no-cache

# 3. HTTP 모드로 초기 시작
docker-compose up -d backend frontend nginx

# 4. SSL 인증서 획득
docker-compose run --rm certbot certonly \
    --webroot \
    -w /var/www/certbot \
    --force-renewal \
    --email your-email@example.com \
    --agree-tos \
    --no-eff-email \
    -d aircleankorea.com \
    -d www.aircleankorea.com

# 5. HTTPS 모드로 재시작
docker-compose down
docker-compose up -d
```

## 🔒 **SSL 인증서 자동 갱신**

### 🔄 **개선된 SSL 갱신 스크립트**

**✨ 업데이트**: `ssl-renew.sh` 스크립트가 자동 경로 감지 기능으로 개선되었습니다.

#### **주요 개선사항:**
- 🧠 **자동 경로 감지**: 스크립트 위치에서 프로젝트 루트를 자동으로 찾음
- ✅ **파일 검증**: docker-compose.yml 존재 여부 확인
- 🛡️ **에러 처리**: 갱신 실패 시 명확한 에러 메시지
- 🔄 **Nginx 리로드**: 갱신 성공 시 자동 Nginx 리로드

crontab에 다음 항목을 추가하여 SSL 인증서를 자동으로 갱신:

```bash
# crontab 편집
crontab -e

# 매일 오전 2시에 인증서 갱신 확인
0 2 * * * /home/arkwith/Dev/WEB_APPS/mission-clean-app/scripts/ssl-renew.sh >> /var/log/ssl-renew.log 2>&1
```

**💡 팁**: production-deploy.sh 실행 시 자동으로 정확한 경로가 안내됩니다.

## 💾 **백업 설정**

### 💾 **개선된 백업 스크립트**

**✨ 업데이트**: `backup.sh` 스크립트가 프로젝트 기반 백업으로 개선되었습니다.

#### **주요 개선사항:**
- 🧠 **자동 경로 감지**: 스크립트 위치에서 프로젝트 루트를 자동으로 찾음
- 📁 **프로젝트 기반 백업**: `./backups/` 디렉토리에 백업 저장
- 🗑️ **자동 정리**: 7일 이상된 백업 파일 자동 삭제
- 📦 **완전 백업**: SQLite DB + SSL 인증서 통합 백업

정기적인 데이터 백업을 위해 crontab에 백업 스크립트 추가:

```bash
# crontab 편집
crontab -e

# 매일 오전 3시에 백업 실행
0 3 * * * /home/arkwith/Dev/WEB_APPS/mission-clean-app/scripts/backup.sh >> /var/log/backup.log 2>&1
```

#### **백업 내용:**
- 📄 **SQLite 데이터베이스**: 고객 정보, 예약 데이터 등
- 🔒 **SSL 인증서**: Let's Encrypt 인증서 백업
- 📦 **통합 아카이브**: 모든 백업을 하나의 tar.gz 파일로 압축

백업 파일은 `./backups/` 디렉토리에 저장되며, 7일 이상된 백업은 자동으로 삭제됩니다.

## 📊 **모니터링 및 관리**

### 서비스 상태 확인

```bash
# 전체 컨테이너 상태
docker-compose ps

# 실시간 로그 확인
docker-compose logs -f

# 특정 서비스 로그 확인
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

### 서비스 관리

```bash
# 전체 서비스 재시작
docker-compose restart

# 특정 서비스만 재시작
docker-compose restart nginx
docker-compose restart backend
docker-compose restart frontend

# 서비스 중지
docker-compose down

# 완전 정리 (볼륨 포함)
docker-compose down -v
```

### 업데이트 배포

```bash
# 새 코드 가져오기
git pull origin main

# 이미지 재빌드 및 배포
docker-compose build --no-cache
docker-compose up -d
```

## 🔗 **서비스 URL**

배포 완료 후 다음 URL에서 서비스에 접근할 수 있습니다:

- **메인 웹사이트**: https://aircleankorea.com
- **API 문서**: https://aircleankorea.com/api-docs
- **API 엔드포인트**: https://aircleankorea.com/api/

## 🛡️ **보안 고려사항**

1. **방화벽 설정**: 필요한 포트 (80, 443, 22)만 열어두기
2. **정기 업데이트**: Docker 이미지와 시스템 패키지 정기 업데이트
3. **로그 모니터링**: 비정상적인 접근 시도 모니터링
4. **백업 검증**: 정기적으로 백업 파일의 무결성 확인
5. **환경 변수 보안**: `.env` 파일의 민감한 정보 보호

## 🚨 **트러블슈팅**

### SSL 인증서 획득 실패

```bash
# DNS 설정 확인
nslookup aircleankorea.com

# 도메인 접근 확인
curl -I http://aircleankorea.com/.well-known/acme-challenge/test

# Certbot 로그 확인
docker-compose logs certbot

# 수동 인증서 획득 재시도
docker-compose run --rm certbot certonly --webroot -w /var/www/certbot --force-renewal --email your-email@example.com --agree-tos --no-eff-email -d aircleankorea.com -d www.aircleankorea.com
```

### 컨테이너 시작 실패

```bash
# 로그 확인
docker-compose logs [service-name]

# 컨테이너 상태 확인
docker ps -a

# 디스크 공간 확인
df -h

# 메모리 사용량 확인
free -h

# Docker 시스템 정리
docker system prune -f
```

### 백엔드 연결 실패

```bash
# 백엔드 헬스체크
docker-compose exec backend curl -f http://localhost:3001/health

# 백엔드 로그 확인
docker-compose logs backend

# 네트워크 연결 확인
docker network ls
docker network inspect mission-clean-app_mission-clean-network
```

## 💡 **유용한 명령어**

```bash
# 전체 로그 실시간 확인
docker-compose logs -f

# 데이터베이스 백업 (수동)
docker-compose exec backend sqlite3 /app/mission_clean.sqlite ".backup /app/backup.sqlite"

# SSL 인증서 수동 갱신
docker-compose run --rm certbot renew

# 컨테이너 리소스 사용량 확인
docker stats

# 특정 컨테이너 내부 접속
docker-compose exec backend sh
docker-compose exec nginx sh

# Nginx 설정 테스트
docker-compose exec nginx nginx -t

# Nginx 리로드
docker-compose exec nginx nginx -s reload
```

## 📈 **성능 최적화**

### 리소스 모니터링

```bash
# 시스템 리소스 확인
htop
iotop

# Docker 컨테이너별 리소스 사용량
docker stats --no-stream
```

### 로그 로테이션

Docker Compose에서 로그 크기가 자동으로 제한됩니다:
- 최대 파일 크기: 10MB (백엔드/프론트엔드/Nginx), 5MB (Certbot)
- 최대 파일 개수: 3개 (백엔드/프론트엔드/Nginx), 2개 (Certbot)

## 🎯 **배포 완료 체크리스트 (2024 업데이트)**

### 📋 **사전 준비 체크리스트**
- [ ] **DNS 설정 확인**: `nslookup aircleankorea.com` (서버 IP로 설정됨)
- [ ] **서버 환경**: Docker & Docker Compose 설치 완료
- [ ] **방화벽 설정**: 포트 80, 443, 22 열림
- [ ] **서버 리소스**: 최소 2GB RAM, 10GB 디스크 여유 공간

### 🚀 **배포 실행 체크리스트**
- [ ] **프로젝트 클론**: `git clone <repository-url> mission-clean-app`
- [ ] **환경 설정**: `.env` 파일에 실제 이메일 주소 설정
- [ ] **⭐ 새로운 통합 배포**: `./scripts/production-deploy.sh` 실행
- [ ] **배포 성공 확인**: HTTPS 접속 테스트
- [ ] **서비스 URL 확인**:
  - [ ] https://aircleankorea.com (메인 사이트)
  - [ ] https://aircleankorea.com/api-docs (API 문서)
  - [ ] https://aircleankorea.com/api/ (API 엔드포인트)

### 🔧 **운영 환경 설정 체크리스트**
- [ ] **SSL 자동 갱신**: cron 설정 (`0 2 * * * ...ssl-renew.sh`)
- [ ] **자동 백업**: cron 설정 (`0 3 * * * ...backup.sh`)
- [ ] **백업 디렉토리 확인**: `./backups/` 디렉토리 생성됨
- [ ] **로그 모니터링**: 컨테이너 로그 확인 (`docker-compose logs -f`)
- [ ] **헬스체크 확인**: 백엔드 응답 테스트

### 🛡️ **보안 및 모니터링 체크리스트**
- [ ] **환경 변수 보안**: `.env` 파일 권한 확인 (600)
- [ ] **SSL 인증서**: Let's Encrypt 인증서 정상 발급
- [ ] **리소스 모니터링**: `docker stats` 명령어로 리소스 사용량 확인
- [ ] **백업 테스트**: 백업 파일 복원 가능한지 테스트

### ⚡ **성능 최적화 체크리스트 (선택사항)**
- [ ] **로그 로테이션**: Docker 로그 제한 설정 확인
- [ ] **Nginx 최적화**: Gzip 압축, 캐싱 설정 확인
- [ ] **데이터베이스 최적화**: SQLite 성능 모니터링

---

## 🎉 **배포 완료!**

모든 체크리스트를 완료했다면 Mission Clean 애플리케이션이 **aircleankorea.com**에서 안전하게 HTTPS로 서비스되고 있습니다.

**📞 문제 발생 시**:
1. 로그 확인: `docker-compose logs -f`
2. 위의 트러블슈팅 섹션 참조
3. 스크립트 재실행: `./scripts/production-deploy.sh`

**🔄 일상 관리**:
- SSL 인증서는 자동으로 갱신됩니다
- 백업은 매일 자동으로 실행됩니다
- 시스템 리소스를 정기적으로 모니터링하세요 