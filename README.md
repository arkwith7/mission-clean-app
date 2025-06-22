# Mission Clean App

## 🧹 프로젝트 소개

'Mission Clean'은 에어컨 청소 예약 서비스를 위한 웹 애플리케이션입니다. 이 프로젝트는 클라이언트(프론트엔드)와 서버(백엔드)가 분리된 구조로 구성되어 있습니다.

## 📂 프로젝트 구조

```
mission-clean-app/
├── client/     # React 기반 프론트엔드 애플리케이션
└── server/     # Node.js 기반 백엔드 API 서버
```

## ✨ 주요 기술 스택

### Client (프론트엔드)
- **Framework/Library**: React
- **Build Tool**: Vite
- **Language**: TypeScript
- **HTTP Client**: Axios
- **Routing**: React Router DOM

### Server (백엔드)
- **Framework**: Node.js, Express.js
- **Database**: SQLite
- **CORS Middleware**: cors

## 🚀 시작하기

이 프로젝트를 로컬 환경에서 실행하려면 아래의 단계를 따라주세요.

### 사전 준비 사항

- [Node.js](https://nodejs.org/) (v18 이상 권장)
- [npm](https://www.npmjs.com/)

### 1. 서버 실행하기

백엔드 서버를 먼저 실행합니다.

```bash
# 1. server 디렉토리로 이동
cd server

# 2. 필요한 패키지 설치
# 참고: package.json에 명시되지 않은 필수 패키지들이 있습니다.
npm install express cors sqlite3 nodemon

# 3. 서버 시작 (nodemon을 통해 실행)
npm start
```

서버는 `http://localhost:3001`에서 실행됩니다. 서버가 실행되면 `mission_clean.db` 파일과 함께 필요한 테이블이 자동으로 생성됩니다.

### 2. 클라이언트 실행하기

프론트엔드 개발 서버를 실행합니다.

```bash
# 1. client 디렉토리로 이동
cd client

# 2. 필요한 패키지 설치
npm install

# 3. 개발 서버 시작
npm run dev
```

vite 개발 서버가 안내하는 주소(예: `http://localhost:5173`)로 접속하여 확인할 수 있습니다.

## 📝 API 엔드포인트

현재 구현된 API 엔드포인트 목록입니다. (현재는 실제 데이터베이스 로직 없이 임시 응답을 반환합니다.)

- `GET /api/bookings`: 모든 예약 목록 조회
- `POST /api/bookings`: 신규 예약 생성 