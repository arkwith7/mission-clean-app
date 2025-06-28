# 🚀 Mission Clean App 배포 가이드

## 🔒 환경변수 보안 관리

### 📋 환경변수 파일 구조
```
📁 mission-clean-app/
├── 🔓 .env.example          # 개발환경 템플릿 (Git 포함)
├── 🔓 env.production.example # 운영환경 템플릿 (Git 포함)
├── 🔒 .env                  # 개발환경 실제값 (Git 제외)
└── 🔒 env.production        # 운영환경 실제값 (Git 제외)
```

### ⚠️ 보안 원칙
- ✅ **템플릿 파일만** Git에 포함 (`.example` 확장자)
- ❌ **실제 환경변수 파일은 절대** Git에 포함하지 않음
- 🔐 **민감한 정보** (API 키, 비밀번호 등)는 서버에서만 관리

---

## 🏗️ 배포 환경별 설정

### 🖥️ **개발 환경 (Local)**
```bash
# 1. 템플릿 복사
cp .env.example .env

# 2. 개발용 값으로 수정
vim .env

# 3. Docker Compose 실행
docker-compose -f docker-compose.dev.yml up -d
```

### 🌐 **운영 환경 (Production Server)**
```bash
# 1. 프로젝트 클론
git clone https://github.com/your-repo/mission-clean-app.git
cd mission-clean-app

# 2. 운영 환경변수 설정
cp env.production.example env.production
vim env.production  # 실제 운영 값으로 수정

# 3. 운영 배포 실행
./deploy.sh
```

---

## 🔐 민감한 정보 관리 방법

### 📱 **네이버 클라우드 SENS API 키**
```bash
# env.production 파일에서 설정
SMS_ENABLED=true
NCLOUD_ACCESS_KEY=NCPxxxxxxxxxxxxxxxxxx
NCLOUD_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NCLOUD_SENS_SERVICE_ID=ncp:sms:kr:xxxxxxxxxx:xxxxxxxx
NCLOUD_SENS_FROM=010-9171-8465
```

### 🗄️ **데이터베이스 보안**
```bash
# 운영환경에서는 강력한 인증 설정
DB_TYPE=postgresql  # 또는 sqlite
DB_PASSWORD=강력한_데이터베이스_비밀번호
```

### 🔑 **JWT 및 세션 보안**
```bash
# 32자 이상의 강력한 시크릿 키 사용
JWT_SECRET=매우_복잡하고_긴_JWT_시크릿_키_32자이상
SESSION_SECRET=매우_복잡하고_긴_세션_시크릿_키
```

---

## 🔧 배포 스크립트 사용법

### 📋 **사전 준비사항**
1. **서버 접속** (SSH)
2. **Docker 및 Docker Compose 설치**
3. **도메인 DNS 설정** (aircleankorea.com)
4. **환경변수 파일 준비** (env.production)

### 🚀 **자동 배포 실행**
```bash
# 권한 부여
chmod +x deploy.sh

# 배포 실행
./deploy.sh

# 배포 완료 후 확인
docker-compose -f docker-compose.prod.yml ps
```

### 📊 **배포 상태 확인**
```bash
# 서비스 상태 확인
curl https://aircleankorea.com/api/health

# 로그 확인
docker-compose -f docker-compose.prod.yml logs -f

# SSL 인증서 확인
curl -I https://aircleankorea.com
```

---

## 🛠️ 문제해결

### ❌ **환경변수 파일 누락**
```bash
Error: env.production file not found

해결방법:
cp env.production.example env.production
vim env.production  # 실제 값 입력
```

### 🔐 **SMS 발송 실패**
```bash
Error: NCLOUD_ACCESS_KEY is invalid

해결방법:
1. 네이버 클라우드 콘솔에서 API 키 재발급
2. env.production 파일 업데이트
3. 컨테이너 재시작: docker-compose restart backend
```

### 🌐 **HTTPS 인증서 문제**
```bash
Error: SSL certificate not found

해결방법:
1. Let's Encrypt 인증서 발급 확인
2. 도메인 DNS 설정 확인
3. 방화벽 80/443 포트 개방 확인
```

---

## 📚 추가 참고자료

- [네이버 클라우드 SENS 가이드](https://guide.ncloud-docs.com/docs/sens-overview)
- [Let's Encrypt SSL 설정](https://letsencrypt.org/getting-started/)
- [Docker Compose 운영 가이드](https://docs.docker.com/compose/production/) 