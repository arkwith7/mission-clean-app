# Mission Clean 종합 시스템 문서
**버전: v2.0 (20250628)**  
**작성일: 2025년 6월 28일**

## 📋 목차
1. [개요](#개요)
2. [시스템 아키텍처](#시스템-아키텍처)
3. [일반 사용자 기능](#일반-사용자-기능)
4. [관리자 시스템](#관리자-시스템)
5. [통합 API 명세](#통합-api-명세)
6. [프론트엔드 컴포넌트](#프론트엔드-컴포넌트)
7. [설치 및 실행](#설치-및-실행)
8. [변경 이력](#변경-이력)

---

## 🎯 개요

Mission Clean은 에어컨 청소 서비스를 위한 완전한 웹 플랫폼으로, 일반 사용자의 예약부터 관리자의 업무 관리까지 모든 기능을 통합 제공합니다.

### 시스템 구성
- **🏠 일반 사용자 시스템**: 예약, 조회, 회원가입/로그인
- **⚙️ 관리자 시스템**: 예약/회원/고객 통합 관리 대시보드
- **📱 통합 플랫폼**: 단일 애플리케이션에서 모든 기능 제공

### 주요 특징
- **🔖 예약 시스템**: 6가지 서비스 타입별 예약 관리
- **📞 실시간 조회**: 전화번호로 예약 상태 확인
- **👤 회원 관리**: 회원가입, 로그인, 권한 관리
- **📊 통합 대시보드**: 예약/회원/고객 현황을 한눈에 확인
- **🔐 역할 기반 접근**: 관리자/매니저/고객별 권한 분리
- **📱 반응형 디자인**: 모든 디바이스에서 최적화된 경험

### 기술 스택
- **프론트엔드**: React 18 + TypeScript + Tailwind CSS + Vite
- **백엔드**: Node.js + Express + Sequelize ORM
- **데이터베이스**: PostgreSQL (운영) / SQLite (개발)
- **인증**: JWT 토큰 기반 인증
- **알림**: SMS 서비스 연동
- **배포**: Docker + Docker Compose

---

## 🏗 시스템 아키텍처

### 전체 구조
```
┌─────────────────┬─────────────────────────────────────┐
│                 │              상단 헤더                │
│                 │   🔧 Mission Clean    👤 사용자      │
├─────────────────┼─────────────────────────────────────┤
│                 │                                     │
│   사이드바      │           워크스페이스               │
│                 │                                     │
│ 📊 대시보드     │        페이지별 콘텐츠               │
│ 📋 예약 관리   │                                     │
│ 👤 회원 관리   │                                     │
│ 🏢 고객 관리   │                                     │
│                 │                                     │
└─────────────────┴─────────────────────────────────────┘
```

### 레이아웃 구조
1. **상단 헤더**: 로고, 사용자 프로필, 로그아웃
2. **사이드바**: 메뉴 네비게이션
3. **워크스페이스**: 각 페이지별 관리 기능

---

## 🚀 일반 사용자 기능

### 1. 🔖 예약 기능
**경로**: `/` (홈페이지 ContactSection)

#### 지원 서비스 타입
- **벽걸이형**: 일반 가정용 벽걸이 에어컨
- **스탠드형**: 대형 스탠드 에어컨
- **시스템1way**: 시스템 에어컨 (1way)
- **시스템4way**: 시스템 에어컨 (4way)
- **실외기**: 실외기 전용 청소
- **2대이상**: 다수 에어컨 청소

#### 예약 프로세스
1. **서비스 선택**: 카드 방식으로 서비스 선택
2. **자동 스크롤**: 선택 후 예약 폼으로 자동 이동
3. **정보 입력**: 필수 정보 및 선택 사항 입력
4. **예약 완료**: 예약번호 발급 및 SMS 알림

```typescript
interface BookingData {
  name: string;           // 고객명 (필수)
  phone: string;          // 전화번호 (필수)
  address: string;        // 서비스 주소 (필수)
  serviceType: string;    // 서비스 타입 (자동 입력)
  preferredDate?: string; // 희망 날짜
  preferredTime?: string; // 희망 시간대
  message?: string;       // 특별 요청사항
}
```

### 2. 📞 예약 확인 기능
**경로**: `/booking-check`

#### 주요 기능
- **간편 조회**: 전화번호만으로 최신 예약 확인
- **상세 정보**: 예약번호, 상태, 서비스 정보 표시
- **실시간 상태**: 관리자가 변경한 상태 즉시 반영

#### 표시 정보
- 예약번호, 고객 정보, 서비스 타입
- 희망 날짜/시간, 현재 상태
- 특별 요청사항, 신청일

#### 상태별 표시
- **접수 대기중** 🟡: 검토 중인 상태
- **예약 확정** 🔵: 일정이 확정된 상태
- **서비스 완료** 🟢: 청소가 완료된 상태
- **취소됨** 🔴: 예약이 취소된 상태

### 3. 👤 회원 기능

#### 3.1 회원가입 (AuthModal)
- **접근**: Header의 "회원가입" 버튼
- **필수 정보**: 사용자명, 이메일, 비밀번호
- **자동 로그인**: 가입 완료 시 즉시 로그인
- **기본 권한**: customer 역할로 자동 설정

#### 3.2 로그인
- **일반 로그인**: Header 모달을 통한 로그인
- **관리자 로그인**: `/admin` 페이지 별도 로그인
- **토큰 관리**: JWT 토큰으로 세션 관리 (7일)

#### 3.3 사용자 프로필
- **헤더 표시**: 로그인한 사용자 정보 표시
- **권한별 메뉴**: 관리자는 관리자 패널 링크 제공
- **로그아웃**: 토큰 제거 및 상태 초기화

---

## ⚙️ 관리자 시스템

### 1. 📊 통합 대시보드
**경로**: `/admin/dashboard`

#### 주요 기능
- **실시간 통계 카드**
  - 예약 현황: 전체/대기/확정/완료/취소
  - 회원 현황: 전체/관리자/매니저/고객/활성
  - 고객 현황: 전체/개인/기업/마케팅동의/SMS동의

- **빠른 실행 버튼**
  - 새 예약 등록
  - 회원 추가
  - 고객 등록
  - 보고서 생성

- **최근 활동 피드**
  - 시간순 정렬된 시스템 활동 내역

#### 통계 데이터
```typescript
interface Stats {
  bookings: {
    total: number;     // 전체 예약 수
    pending: number;   // 대기중 예약
    confirmed: number; // 확정 예약
    completed: number; // 완료 예약
    cancelled: number; // 취소 예약
  };
  users: {
    total: number;     // 전체 사용자
    admin: number;     // 관리자 수
    manager: number;   // 매니저 수
    customer: number;  // 고객 수
    active: number;    // 활성 사용자
  };
  customers: {
    total: number;           // 전체 고객
    individual: number;      // 개인 고객
    corporate: number;       // 기업 고객
    marketingConsent: number; // 마케팅 동의
    smsConsent: number;      // SMS 동의
  };
}
```

### 2. 📋 예약 관리
**경로**: `/admin/bookings`

#### 주요 기능
- **예약 목록 조회**
  - 검색: 이름, 전화번호, 주소, 서비스 타입
  - 필터: 상태별 (대기/확정/완료/취소)
  - 날짜 범위: 신청 시작일 ~ 종료일
  - 페이지네이션: 10개씩 표시

- **예약 상태 관리**
  - 실시간 상태 변경 (드롭다운)
  - 상태별 색상 코딩
  - 변경 이력 추적

- **예약 정보 표시**
  - 예약번호, 고객정보, 서비스 타입
  - 희망일시, 현재 상태, 신청일
  - 특별 요청사항

#### 예약 상태 정의
- `pending`: 대기중 (노란색)
- `confirmed`: 확정 (파란색)
- `completed`: 완료 (초록색)
- `cancelled`: 취소 (빨간색)

### 3. 👤 회원 관리
**경로**: `/admin/users`

#### 주요 기능
- **회원 CRUD**
  - 생성: 사용자명, 이메일, 비밀번호, 역할, 상태
  - 조회: 검색 및 필터링
  - 수정: 정보 변경, 비밀번호 재설정
  - 삭제: 안전한 삭제 (확인 다이얼로그)

- **검색 및 필터**
  - 검색: 사용자명, 이메일
  - 역할 필터: 전체/관리자/매니저/고객
  - 상태 필터: 전체/활성/비활성/정지

- **권한 관리**
  - 역할별 접근 제어
  - 실시간 상태 변경
  - 자기 계정 삭제 방지

#### 사용자 역할
- `admin`: 관리자 (모든 권한)
- `manager`: 매니저 (예약/고객 관리)
- `customer`: 고객 (예약 조회만)

#### 사용자 상태
- `active`: 활성 (로그인 가능)
- `inactive`: 비활성 (로그인 불가)
- `suspended`: 정지 (일시적 차단)

### 4. 🏢 고객 관리
**경로**: `/admin/customers`

#### 주요 기능
- **고객 CRUD**
  - 등록: 개인정보, 연락처, 주소, 동의 사항
  - 조회: 다양한 필터링 옵션
  - 수정: 정보 업데이트
  - 삭제: 예약 내역 확인 후 삭제

- **고급 필터링**
  - 검색: 이름, 전화번호, 이메일, 주소
  - 고객유형: 개인/기업
  - 연령대: 20대/30대/40대/50대/60대+
  - 등록경로: 웹사이트/전화/추천/마케팅

- **상세 정보 관리**
  - 기본정보: 이름, 연락처, 주소
  - 분류정보: 고객유형, 연령대, 성별
  - 마케팅: 마케팅 동의, SMS 동의
  - 예약 내역: 연결된 예약 수 표시

#### 고객 분류
- **고객유형**
  - `individual`: 개인 고객
  - `business`: 기업 고객

- **연령대**: `20s`, `30s`, `40s`, `50s`, `60s+`
- **성별**: `male`, `female`, `other`
- **등록경로**: `website`, `phone`, `referral`, `marketing`

---

## 🔌 통합 API 명세

### 일반 사용자 API

#### 예약 관리 (`/api/bookings`)

##### POST `/api/bookings`
예약 신청 (공개 API)

**Request Body:**
```json
{
  "name": "홍길동",
  "phone": "010-1234-5678",
  "address": "대전광역시 중구 테스트동 123번지",
  "serviceType": "벽걸이형",
  "preferredDate": "2025-07-10",
  "preferredTime": "afternoon",
  "message": "2층에 위치한 에어컨입니다."
}
```

**Response:**
```json
{
  "success": true,
  "message": "예약 신청이 완료되었습니다",
  "bookingId": 42,
  "data": {
    "name": "홍길동",
    "phone": "010-1234-5678",
    "serviceType": "벽걸이형"
  }
}
```

##### POST `/api/bookings/check`
예약 확인 (공개 API)

**Request Body:**
```json
{
  "phone": "010-1234-5678"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "booking_id": 42,
    "customer_name": "홍길동",
    "customer_phone": "010-1234-5678",
    "customer_address": "대전광역시 중구 테스트동 123번지",
    "service_type": "벽걸이형",
    "service_date": "2025-07-10",
    "service_time": "afternoon",
    "special_requests": "2층에 위치한 에어컨입니다.",
    "status": "pending",
    "created_at": "2025-06-28T10:30:00Z"
  }
}
```

#### 사용자 인증 (`/api/auth`)

##### POST `/api/auth/register`
회원가입 (공개 API)

**Request Body:**
```json
{
  "username": "신규고객",
  "email": "customer@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 5,
      "username": "신규고객",
      "email": "customer@example.com",
      "role": "customer"
    }
  }
}
```

##### POST `/api/auth/login`
로그인 (공개 API)

**Request Body:**
```json
{
  "email": "customer@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "로그인이 완료되었습니다.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 5,
      "username": "신규고객",
      "email": "customer@example.com",
      "role": "customer"
    }
  }
}
```

### 관리자 전용 API

#### 예약 관리 (`/api/bookings` - 관리자/매니저 전용)

##### GET `/api/bookings`
예약 목록 조회 (관리자/매니저 전용)

**Query Parameters:**
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 10)
- `search`: 검색어
- `status`: 상태 필터
- `dateFrom`: 시작일
- `dateTo`: 종료일

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "booking_id": 37,
      "customer_name": "김갑동",
      "customer_phone": "010-3456-1234",
      "customer_address": "대전시 동구 중동",
      "service_type": "2대이상",
      "service_date": "2025-07-03",
      "service_time": "오후 (1시-5시)",
      "status": "pending",
      "created_at": "2025-06-28T10:30:00Z"
    }
  ]
}
```

##### GET `/api/bookings/:id`
특정 예약 조회 (관리자/매니저 전용)

##### PUT `/api/bookings/:id/status`
예약 상태 변경 (관리자/매니저 전용)

**Request Body:**
```json
{
  "status": "confirmed"
}
```

#### 회원 관리 (`/api/users` - 관리자 전용)

##### GET `/api/users`
사용자 목록 조회 (관리자 전용)

**Query Parameters:**
- `page`, `limit`: 페이지네이션
- `search`: 사용자명, 이메일 검색
- `role`: 역할 필터 (`admin`, `manager`, `customer`)
- `status`: 상태 필터 (`active`, `inactive`, `suspended`)

##### POST `/api/users`
새 사용자 생성 (관리자 전용)

**Request Body:**
```json
{
  "username": "새사용자",
  "email": "user@example.com",
  "password": "password123",
  "role": "manager",
  "status": "active"
}
```

#### GET `/api/users/:id`
특정 사용자 조회

#### PUT `/api/users/:id`
사용자 정보 수정

#### DELETE `/api/users/:id`
사용자 삭제 (자기 계정 삭제 방지)

#### PATCH `/api/users/:id/status`
사용자 상태 변경

### 고객 관리 API (`/api/customers`)

#### GET `/api/customers`
고객 목록 조회

**Query Parameters:**
- `page`, `limit`: 페이지네이션
- `search`: 이름, 전화번호, 이메일, 주소 검색
- `customerType`: 고객유형 (`individual`, `business`)
- `ageGroup`: 연령대
- `registrationSource`: 등록경로

#### POST `/api/customers`
새 고객 등록

**Request Body:**
```json
{
  "name": "홍길동",
  "phone": "010-1234-5678",
  "email": "hong@example.com",
  "address": "서울시 강남구",
  "detailed_address": "테헤란로 123",
  "age_group": "30s",
  "gender": "male",
  "customer_type": "individual",
  "registration_source": "website",
  "marketing_consent": true,
  "sms_consent": false
}
```

#### GET `/api/customers/:id`
특정 고객 조회

#### PUT `/api/customers/:id`
고객 정보 수정

#### DELETE `/api/customers/:id`
고객 삭제 (예약 내역 확인)

#### GET `/api/customers/stats/overview`
고객 통계 조회

**Response:**
```json
{
  "success": true,
  "data": {
    "customersByType": {
      "individual": 120,
      "corporate": 36
    },
    "consentStats": {
      "marketingConsent": 89,
      "smsConsent": 134
    }
  }
}
```

### 미들웨어

#### `authenticateToken`
JWT 토큰 검증

#### `requireRole(roles)`
역할 기반 접근 제어
```javascript
// 사용 예시
router.get('/', authenticateToken, requireRole(['admin']), handler);
```

#### 역할 권한 매트릭스
| 기능 | Admin | Manager | Customer |
|------|-------|---------|----------|
| 예약 조회 | ✅ | ✅ | 본인만 |
| 예약 관리 | ✅ | ✅ | ❌ |
| 회원 관리 | ✅ | ❌ | ❌ |
| 고객 관리 | ✅ | ✅ | ❌ |
| 통계 조회 | ✅ | ✅ | ❌ |

---

## 🎨 프론트엔드 컴포넌트

### 핵심 컴포넌트 구조

```
src/
├── components/
│   ├── admin/
│   │   ├── AdminLayout.tsx          # 관리자 레이아웃
│   │   ├── DashboardStats.tsx       # 통계 대시보드
│   │   ├── BookingManagement.tsx    # 예약 관리
│   │   ├── UserManagement.tsx       # 회원 관리
│   │   └── CustomerManagement.tsx   # 고객 관리
│   ├── Header.tsx                   # 일반 헤더
│   └── Footer.tsx                   # 푸터
├── pages/
│   ├── AdminLoginPage.tsx           # 관리자 로그인
│   ├── AdminDashboardMain.tsx       # 대시보드 페이지
│   ├── AdminBookingsPage.tsx        # 예약 관리 페이지
│   ├── AdminUsersPage.tsx           # 회원 관리 페이지
│   └── AdminCustomersPage.tsx       # 고객 관리 페이지
├── services/
│   └── api.ts                       # API 서비스
├── types/
│   └── admin.ts                     # 타입 정의
└── contexts/
    └── AuthContext.tsx              # 인증 컨텍스트
```

### AdminLayout 컴포넌트
상하 분할 → 좌우 분할 구조의 관리자 전용 레이아웃

**주요 특징:**
- 반응형 디자인
- 사이드바 네비게이션
- 사용자 프로필 드롭다운
- 홈페이지 링크 (Mission Clean 로고)

### 라우팅 구조
```typescript
// 일반 사용자 페이지 (Header + Footer 포함)
<Route path="/" element={<HomePage />} />
<Route path="/booking-check" element={<BookingCheckPage />} />

// 관리자 페이지 (AdminLayout 사용)
<Route path="/admin" element={<AdminLoginPage />} />
<Route path="/admin/dashboard" element={<AdminDashboardMain />} />
<Route path="/admin/bookings" element={<AdminBookingsPage />} />
<Route path="/admin/users" element={<AdminUsersPage />} />
<Route path="/admin/customers" element={<AdminCustomersPage />} />
```

### 상태 관리
- **AuthContext**: 로그인 상태, 사용자 정보
- **지역 상태**: 각 컴포넌트별 데이터 관리
- **API 캐싱**: 없음 (실시간 데이터 우선)

---

## 🚀 설치 및 실행

### 개발 환경 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp .env.example .env

# 3. Docker 개발 환경 실행
docker-compose -f docker-compose.dev.yml up --build -d

# 4. 접속
# 프론트엔드: http://localhost:3000
# 백엔드: http://localhost:3001
# 관리자: http://localhost:3000/admin
```

### 기본 관리자 계정
- **이메일**: `admin@aircleankorea.com`
- **비밀번호**: `admin1234`

### 운영 환경 배포

```bash
# 1. 환경 변수 설정
cp env.production.example env.production

# 2. 운영 환경 실행
docker-compose -f docker-compose.prod.yml up -d
```

### 환경 변수

**백엔드 (.env)**
```env
NODE_ENV=development
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# Database
DB_HOST=db
DB_PORT=5432
DB_NAME=mission_clean
DB_USER=postgres
DB_PASSWORD=password

# SQLite (개발용)
SQLITE_PATH=./database.sqlite
```

**프론트엔드 (import.meta.env)**
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

---

## 📈 변경 이력

### v2.0 (2025-06-28)
**주요 변경사항: 관리자 시스템 완전 개편**

#### 🎨 UI/UX 개선
- **레이아웃 전면 개편**
  - 기존: 탭 기반 인터페이스
  - 신규: 상하 분할 → 좌우 분할 구조
  - 사이드바 네비게이션 도입

- **디자인 시스템 통일**
  - 관리자 전용 헤더 (일반 네비게이션 제거)
  - Mission Clean 브랜딩 적용
  - 아이콘 + 텍스트 조합으로 직관성 향상

#### 🔧 기능 개선
- **대시보드 분리**
  - 통계 중심의 메인 대시보드 신설
  - 각 관리 페이지에서 중복 통계 제거
  - 실시간 데이터 표시

- **페이지 독립화**
  - 예약/회원/고객 관리를 별도 페이지로 분리
  - 각 페이지별 전용 URL 할당
  - 페이지별 타이틀 및 설명 추가

#### 🔌 백엔드 API 확장
- **User 관리 API 신규 구현**
  - 완전한 CRUD 지원
  - 역할 기반 접근 제어
  - 상태 관리 (활성/비활성/정지)

- **Customer 관리 API 고도화**
  - 기존 단순 upsert → 완전한 CRUD
  - 고급 필터링 옵션
  - 통계 데이터 제공

- **인증 시스템 강화**
  - `requireRole` 미들웨어 추가
  - 세분화된 권한 제어
  - JWT 토큰 보안 강화

#### 🏗 아키텍처 개선
- **컴포넌트 구조 최적화**
  - AdminLayout 컴포넌트로 레이아웃 통일
  - 페이지별 독립 컴포넌트 분리
  - 재사용 가능한 컴포넌트 설계

- **라우팅 구조 개선**
  - 일반 사용자 / 관리자 라우팅 분리
  - Header/Footer 조건부 렌더링
  - 관리자 전용 라우팅 그룹화

#### 🐛 버그 수정
- `requireRole` 함수 누락으로 인한 서버 크래시 해결
- API 타입 불일치 문제 해결
- 린터 오류 수정 (any 타입 제거)

### v1.0 (이전 버전)
- 기본 예약 관리 시스템
- 탭 기반 관리자 인터페이스
- 기본 CRUD 기능

---

## 📞 지원 및 문의

### 기술 지원
- **개발팀**: dev@missionclean.co.kr
- **전화**: 010-9171-8465

### 문서 업데이트
이 문서는 시스템 변경사항에 따라 지속적으로 업데이트됩니다.

**최종 업데이트**: 2025년 6월 28일  
**다음 업데이트 예정**: 2025년 7월 말

---

*© 2025 Mission Clean. All rights reserved.* 