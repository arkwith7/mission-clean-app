# Mission Clean App

## 🧹 프로젝트 소개

'Mission Clean'은 에어컨 청소 예약 서비스를 위한 웹 애플리케이션입니다. 이 프로젝트는 클라이언트(프론트엔드)와 서버(백엔드)가 분리된 구조로 구성되어 있습니다.

## 📂 프로젝트 구조

```
mission-clean-app/
├── client/     # React 기반 프론트엔드 애플리케이션
└── server/     # Node.js + Express + Sequelize 기반 백엔드 API 서버
```

## ✨ 주요 기술 스택

### Client (프론트엔드)
- **Framework**: React
- **Build Tool**: Vite
- **Language**: TypeScript
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS

### Server (백엔드)
- **Framework**: Node.js, Express.js
- **ORM**: Sequelize
- **Database**: SQLite (`mission_clean.sqlite`)
- **Swagger**: swagger-ui-express, swagger-jsdoc
- **Middleware**: cors, body-parser

## 🚀 시작하기

### 사전 준비 사항

- Node.js (v18 이상 권장)
- npm

### 🔐 보안 설정 (필수)

1. **환경 변수 설정**
   ```bash
   # .env 파일을 생성하고 다음 변수들을 설정하세요
   cp env.example .env
   ```

2. **JWT_SECRET 설정**
   - 최소 32자 이상의 강력한 랜덤 문자열로 설정
   - 프로덕션에서는 절대 기본값을 사용하지 마세요

3. **기본 패스워드 변경**
   - 관리자 계정의 기본 패스워드를 즉시 변경하세요
   - 환경 변수로 `DEFAULT_ADMIN_PASSWORD`, `DEFAULT_MANAGER_PASSWORD` 설정 가능

### 1. 서버 실행하기
```bash
# server 디렉토리로 이동
cd server

# 1) 패키지 설치
npm install

# 2) 서버 시작
npm start
```
서버는 `http://localhost:3001`에서 실행되며, Swagger 문서는 `http://localhost:3001/api-docs`에서 확인할 수 있습니다.

### 2. 클라이언트 실행하기
```bash
# client 디렉토리로 이동
cd client

# 패키지 설치
npm install

# 개발 서버 시작
npm run dev
```
Vite 개발 서버가 안내하는 주소(예: `http://localhost:5173`)로 접속하여 확인할 수 있습니다.

### Sequelize ORM 사용법
- 설정 파일: `server/config/config.js`에서 개발/테스트/프로덕션 환경별 데이터베이스 경로 정의
- 모델 정의: `server/models/` 디렉토리 내 각 모델(Booting.js, Customer.js, AirconSpec.js)에 컬럼 및 관계를 선언
- 데이터베이스 연결 및 동기화: `server/models/index.js`에서 `sequelize.sync()`를 호출하여 테이블을 자동 생성/업데이트
- 예시 코드:
  ```js
  const { Booking } = require('./models');
  // 모든 예약 조회
  const bookings = await Booking.findAll();

  // 신규 예약 생성
  const newBooking = await Booking.create({
    customer_name: '홍길동',
    customer_phone: '010-1234-5678',
    customer_address: '대전광역시 중구',
    service_date: '2025-07-01',
    service_time: '10:00',
    service_type: 'basic'
  });
  ```

## 📝 API 엔드포인트

### Swagger
- `GET /api-docs` : API 문서 UI

### Bookings
- `GET /api/bookings` : 모든 예약 조회
- `POST /api/bookings` : 신규 예약 생성 (중복 방지)
- `PUT /api/bookings/:id/status` : 예약 상태 업데이트

### Customers
- `POST /api/customers` : 고객 정보 생성/업데이트 (Upsert)

### Aircon Specs
- `GET /api/aircon-specs` : 모든 에어컨 스펙 조회
- `GET /api/aircon-specs/:modelName` : 모델명으로 스펙 조회

```json
// 예시 요청 및 응답 형식은 Swagger 문서를 참고하세요.
```

## 🐳 프로덕션 배포

### 배포 환경
- **Domain**: aircleankorea.com
- **HTTPS**: Let's Encrypt SSL 인증서
- **Container**: Docker Compose
- **Reverse Proxy**: Nginx
- **Database**: SQLite (프로덕션 환경에서도 사용)

### 1. 사전 준비
```bash
# Docker 및 Docker Compose 설치 확인
docker --version
docker-compose --version

# 프로젝트 클론
git clone <repository-url>
cd mission-clean-app
```

### 2. 환경 설정
```bash
# 환경 파일 생성
cp env.example .env

# 필수 환경 변수 설정
nano .env
```

**중요**: 다음 변수들을 반드시 수정하세요:
- `JWT_SECRET`: 강력한 32자 이상의 랜덤 문자열
- `EMAIL`: Let's Encrypt SSL 인증서 발급용 이메일

### 3. 자동 배포 실행
```bash
# 배포 스크립트 실행 권한 부여
chmod +x scripts/production-deploy.sh

# 프로덕션 배포 실행
./scripts/production-deploy.sh
```

### 4. 수동 배포 (선택사항)
```bash
# 1. 이미지 빌드
docker-compose -f docker-compose.prod.yml build

# 2. 서비스 시작
docker-compose -f docker-compose.prod.yml up -d

# 3. SSL 인증서 발급
docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  --email your-email@example.com \
  --agree-tos --no-eff-email \
  -d aircleankorea.com -d www.aircleankorea.com
```

### 5. 서비스 관리
```bash
# 서비스 상태 확인
docker-compose -f docker-compose.prod.yml ps

# 로그 확인
docker-compose -f docker-compose.prod.yml logs -f

# 서비스 재시작
docker-compose -f docker-compose.prod.yml restart

# 서비스 중지
docker-compose -f docker-compose.prod.yml down
```

### 6. SSL 자동 갱신 설정
```bash
# Cron job 설정
crontab -e

# 다음 라인 추가 (매일 새벽 2시에 실행)
0 2 * * * /path/to/mission-clean-app/scripts/ssl-renew.sh >> /var/log/ssl-renew.log 2>&1
```

### 7. 백업 설정
```bash
# 백업 스크립트 실행
./scripts/backup.sh

# 자동 백업 Cron job 설정 (매일 새벽 3시)
0 3 * * * /path/to/mission-clean-app/scripts/backup.sh >> /var/log/backup.log 2>&1
```

### 8. 모니터링
```bash
# 컨테이너 리소스 사용량 확인
docker stats

# 디스크 사용량 확인
df -h

# 로그 파일 크기 확인
du -sh nginx/logs/ server/logs/
```

## 🔧 유지보수

### 로그 관리
- **서버 로그**: `server/logs/`
- **Nginx 로그**: `nginx/logs/`
- **Docker 로그**: `docker-compose logs`

### 데이터베이스 백업
```bash
# 수동 백업
./scripts/backup.sh

# 백업 파일 위치
ls -la backups/
```

### 보안 업데이트
```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade

# Docker 이미지 업데이트
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## 🆘 문제 해결

### 일반적인 문제
1. **SSL 인증서 오류**: DNS 설정 확인
2. **컨테이너 시작 실패**: 로그 확인 (`docker-compose logs`)
3. **데이터베이스 연결 실패**: 파일 권한 및 경로 확인

### 응급 복구
```bash
# 서비스 전체 재시작
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# 데이터베이스 복구
tar xzf backups/backup_YYYYMMDD_HHMMSS.tar.gz -C backups/
cp backups/backup_YYYYMMDD_HHMMSS/mission_clean.sqlite server/
```