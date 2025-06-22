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

- Node.js (v14 이상 권장)
- npm

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