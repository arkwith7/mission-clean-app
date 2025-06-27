# 🗄️ Mission Clean 데이터베이스 설계

이 문서는 '에어컨 청소 중개 플랫폼'의 서비스 시나리오를 기반으로 설계된 데이터베이스 스키마를 정의합니다. 각 테이블은 특정 역할(고객, 기사, 관리자)의 핵심 기능을 지원하도록 구성되었습니다.

---

## 🚀 구축 우선순위

안정적이고 빠른 서비스 런칭을 위해 다음과 같이 구축 우선순위를 제안합니다. 고객이 서비스를 경험하는 핵심 플로우를 최우선으로 개발합니다.

### **1순위: 고객 핵심 서비스 (MVP Core)**
- **목표**: 고객이 회원가입부터 서비스 예약, 결제까지 완료할 수 있는 핵심 사이클을 구현합니다.
- **관련 테이블**: `users`, `customers`, `services`, `bookings`, `booking_services`, `payments`
- **주요 기능**:
    - 이메일/소셜 회원가입 및 로그인
    - 서비스 목록 조회 및 선택
    - 원하는 날짜/시간에 서비스 예약
    - 예약 정보 기반 결제 진행
    - 내 예약 내역 확인

### **2순위: 서비스 기사 핵심 기능**
- **목표**: 배정된 기사가 작업을 확인하고 수행하며, 완료 보고까지 할 수 있는 기능을 구현합니다.
- **관련 테이블**: `technicians`, `service_reports` + (1순위 테이블)
- **주요 기능**:
    - 기사 프로필 관리
    - 신규 예약 확인 및 수락
    - 작업 상태 변경 (예: 이동중, 서비스중, 완료)
    - 서비스 완료 후 작업 보고서 작성 및 제출

### **3순위: 플랫폼 고도화 및 운영**
- **목표**: 서비스의 신뢰도를 높이고 운영을 효율화하는 부가 기능을 구현합니다.
- **관련 테이블**: `reviews`, `settlements`, `notifications` + (1, 2순위 테이블)
- **주요 기능**:
    - 고객의 서비스 리뷰 작성 및 조회
    - 관리자의 기사 정산 관리
    - 예약 상태 변경 등 주요 이벤트에 대한 알림 발송
    - 관리자 대시보드 및 회원/예약 관리 기능

---

## 1. 사용자 및 권한 관리
**[시나리오 연관성]**
- **고객**: 회원가입/로그인, 소셜 로그인 기능을 지원합니다.
- **서비스 기사**: 관리자의 승인을 통해 가입하고, 자신의 프로필을 관리합니다.
- **관리자**: 시스템의 모든 사용자를 관리합니다.

### `users` (사용자)
- 모든 시스템 사용자(고객, 기사, 관리자)의 기본 정보를 저장합니다.
- 소셜 로그인을 고려하여 `provider`와 `social_id` 컬럼을 추가합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
| --- | --- | --- | --- |
| `user_id` | `INT` | PK, AUTO_INCREMENT | 사용자 식별자 |
| `email` | `VARCHAR(100)` | UNIQUE, NOT NULL | 이메일 (로그인 ID) |
| `password_hash` | `VARCHAR(255)` | | 비밀번호 해시 (이메일 가입 시) |
| `name` | `VARCHAR(50)` | NOT NULL | 이름 |
| `phone` | `VARCHAR(20)` | UNIQUE, NOT NULL | 연락처 |
| `role` | `ENUM('customer', 'technician', 'admin')` | NOT NULL | 사용자 역할 |
| `status` | `ENUM('pending', 'active', 'inactive', 'suspended')` | DEFAULT 'pending' | 계정 상태 (기사 승인 대기 등) |
| `provider` | `ENUM('local', 'kakao', 'naver')` | DEFAULT 'local' | 가입 경로 (소셜 로그인) |
| `social_id` | `VARCHAR(255)` | | 소셜 로그인 ID |
| `created_at` | `TIMESTAMP` | DEFAULT CURRENT_TIMESTAMP | 생성일시 |
| `updated_at` | `TIMESTAMP` | ON UPDATE CURRENT_TIMESTAMP | 수정일시 |
| `last_login` | `TIMESTAMP` | | 마지막 로그인 |

### `customers` (고객)
- 고객의 상세 정보를 저장합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
| --- | --- | --- | --- |
| `customer_id` | `INT` | PK, AUTO_INCREMENT | 고객 식별자 |
| `user_id` | `INT` | NOT NULL, FK -> `users`.`user_id` | 사용자 참조 |
| `address` | `TEXT` | | 주소 |
| `marketing_consent` | `BOOLEAN` | DEFAULT FALSE | 마케팅 동의 |
| `created_at` | `TIMESTAMP` | DEFAULT CURRENT_TIMESTAMP | 생성일시 |
| `updated_at` | `TIMESTAMP` | ON UPDATE CURRENT_TIMESTAMP | 수정일시 |

### `technicians` (서비스 기사)
- 서비스 기사의 프로필, 전문 분야 등 상세 정보를 저장합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
| --- | --- | --- | --- |
| `technician_id` | `INT` | PK, AUTO_INCREMENT | 기사 식별자 |
| `user_id` | `INT` | NOT NULL, FK -> `users`.`user_id` | 사용자 참조 |
| `profile_image_url` | `VARCHAR(255)` | | 프로필 사진 URL |
| `introduction` | `TEXT` | | 자기소개 |
| `expertise` | `JSON` | | 전문 분야 (e.g., `["벽걸이", "스탠드"]`) |
| `service_area` | `JSON` | | 서비스 가능 지역 (e.g., `["서울시 강남구", "경기도 성남시"]`) |
| `career_years` | `INT` | | 경력 (년차) |
| `rating_average` | `DECIMAL(3, 2)` | DEFAULT 0.00 | 평균 별점 |
| `created_at` | `TIMESTAMP` | DEFAULT CURRENT_TIMESTAMP | 생성일시 |
| `updated_at` | `TIMESTAMP` | ON UPDATE CURRENT_TIMESTAMP | 수정일시 |

---

## 2. 에어컨 제품 관리

### ac_brands (에어컨 브랜드)
| 컬럼명        | 타입            | 제약조건                 | 설명               |
|---------------|-----------------|--------------------------|--------------------|
| brand_id      | INT             | PK, AUTO_INCREMENT       | 브랜드 식별자      |
| brand_name    | VARCHAR(50)     | NOT NULL                 | 브랜드명           |
| brand_name_en | VARCHAR(50)     |                          | 브랜드명(영문)     |
| logo_url      | VARCHAR(255)    |                          | 로고 URL           |
| website_url   | VARCHAR(255)    |                          | 웹사이트 URL       |
| support_phone | VARCHAR(20)     |                          | 고객지원 연락처    |
| is_active     | BOOLEAN         | DEFAULT TRUE             | 활성 상태         |
| created_at    | TIMESTAMP       | DEFAULT CURRENT_TIMESTAMP| 생성일시          |

### ac_models (에어컨 모델)
| 컬럼명            | 타입                                   | 제약조건                                         | 설명                    |
|-------------------|----------------------------------------|--------------------------------------------------|-------------------------|
| model_id          | INT                                    | PK, AUTO_INCREMENT                               | 모델 식별자             |
| brand_id          | INT                                    | NOT NULL, FK -> ac_brands.brand_id               | 브랜드 참조             |
| model_name        | VARCHAR(100)                           | NOT NULL                                         | 모델명                  |
| model_code        | VARCHAR(50)                            |                                                  | 모델 코드               |
| type              | ENUM('wall','stand','ceiling','window','portable')| NOT NULL                               | 에어컨 형태             |
| cooling_capacity  | DECIMAL(5,2)                           |                                                  | 냉방 용량 (BTU/h)       |
| energy_rating     | ENUM('1','2','3','4','5')             |                                                  | 에너지 등급             |
| refrigerant_type  | VARCHAR(20)                            |                                                  | 냉매 종류               |
| filter_type       | VARCHAR(100)                           |                                                  | 필터 종류               |
| inverter_type     | ENUM('inverter','fixed')              | DEFAULT 'inverter'                              | 인버터 타입             |
| release_year      | YEAR                                   |                                                  | 출시 연도               |
| manual_url        | VARCHAR(255)                           |                                                  | 매뉴얼 URL              |
| image_url         | VARCHAR(255)                           |                                                  | 이미지 URL              |
| cleaning_notes    | TEXT                                   |                                                  | 청소 주의사항           |
| is_active         | BOOLEAN                                | DEFAULT TRUE                                     | 활성 상태              |
| created_at        | TIMESTAMP                              | DEFAULT CURRENT_TIMESTAMP                        | 생성일시               |

### customer_aircons (고객 에어컨 정보)
| 컬럼명              | 타입                           | 제약조건                                    | 설명              |
|---------------------|--------------------------------|---------------------------------------------|-------------------|
| aircon_id           | INT                            | PK, AUTO_INCREMENT                          | 고객 에어컨 식별자|
| customer_id         | INT                            | NOT NULL, FK -> customers.customer_id       | 고객 참조         |
| model_id            | INT                            | FK -> ac_models.model_id                    | 모델 참조         |
| installation_date   | DATE                           |                                             | 설치 날짜         |
| room_location       | VARCHAR(50)                    |                                             | 설치 위치         |
| usage_frequency     | ENUM('daily','weekly','seasonal')|                                          | 사용 빈도         |
| last_self_cleaning  | DATE                           |                                             | 마지막 자가 청소  |
| notes               | TEXT                           |                                             | 비고              |
| is_active           | BOOLEAN                        | DEFAULT TRUE                                | 활성 상태         |
| created_at          | TIMESTAMP                      | DEFAULT CURRENT_TIMESTAMP                   | 생성일시         |

---
## 3. 서비스 및 예약 관리
**[시나리오 연관성]**
- **고객**: 서비스 종류를 보고 선택하며, 원하는 날짜와 주소로 예약을 신청합니다. 자신의 예약 상태를 실시간으로 확인하고 변경/취소할 수 있습니다.
- **서비스 기사**: 배정된 예약을 확인하고, 고객 정보와 요청사항을 파악합니다.
- **관리자**: 모든 예약 현황을 모니터링하고, 필요시 수동으로 예약을 관리합니다.

### `services` (서비스)
- 제공하는 서비스의 종류와 가격 정보를 관리합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
| --- | --- | --- | --- |
| `service_id` | `INT` | PK, AUTO_INCREMENT | 서비스 식별자 |
| `service_name` | `VARCHAR(100)` | NOT NULL | 서비스명 (e.g., "벽걸이 에어컨 기본 세척") |
| `description` | `TEXT` | | 상세 설명 |
| `price` | `DECIMAL(10, 2)` | NOT NULL | 기본 가격 |
| `duration_minutes` | `INT` | | 예상 소요 시간 (분) |
| `is_active` | `BOOLEAN` | DEFAULT TRUE | 활성 상태 |
| `created_at` | `TIMESTAMP` | DEFAULT CURRENT_TIMESTAMP | 생성일시 |
| `updated_at` | `TIMESTAMP` | ON UPDATE CURRENT_TIMESTAMP | 수정일시 |

### `bookings` (예약)
- 고객의 서비스 예약 정보를 관리합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
| --- | --- | --- | --- |
| `booking_id` | `INT` | PK, AUTO_INCREMENT | 예약 식별자 |
| `customer_id` | `INT` | NOT NULL, FK -> `customers`.`customer_id` | 고객 참조 |
| `technician_id` | `INT` | FK -> `technicians`.`technician_id` | 배정된 기사 참조 |
| `service_datetime` | `TIMESTAMP` | NOT NULL | 서비스 희망/예정 일시 |
| `status` | `ENUM('pending', 'confirmed', 'technician_assigned', 'on_the_way', 'in_progress', 'completed', 'cancelled')` | DEFAULT 'pending' | 예약 상태 |
| `address` | `TEXT` | NOT NULL | 서비스 주소 |
| `special_requests` | `TEXT` | | 특별 요청사항 |
| `total_price` | `DECIMAL(10, 2)` | | 최종 결제 금액 |
| `created_at` | `TIMESTAMP` | DEFAULT CURRENT_TIMESTAMP | 생성일시 |
| `updated_at` | `TIMESTAMP` | ON UPDATE CURRENT_TIMESTAMP | 수정일시 |

### `booking_services` (예약-서비스 내역)
- 한 예약에 여러 서비스가 포함될 경우를 대비한 중간 테이블입니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
| --- | --- | --- | --- |
| `booking_service_id` | `INT` | PK, AUTO_INCREMENT | 식별자 |
| `booking_id` | `INT` | NOT NULL, FK -> `bookings`.`booking_id` | 예약 참조 |
| `service_id` | `INT` | NOT NULL, FK -> `services`.`service_id` | 서비스 참조 |
| `quantity` | `INT` | NOT NULL, DEFAULT 1 | 수량 |
| `price_at_booking` | `DECIMAL(10, 2)` | NOT NULL | 예약 시점의 단가 |

---

## 4. 결제 및 정산 관리
**[시나리오 연관성]**
- **고객**: 예약 시 등록된 결제수단으로 간편하게 선결제합니다.
- **서비스 기사**: 완료한 작업에 대한 수익과 정산 내역을 확인합니다.
- **관리자**: 전체 매출과 수수료를 관리하고, 기사별 정산을 실행합니다.

### `payments` (결제)
- 예약에 대한 결제 정보를 관리합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
| --- | --- | --- | --- |
| `payment_id` | `INT` | PK, AUTO_INCREMENT | 결제 식별자 |
| `booking_id` | `INT` | NOT NULL, FK -> `bookings`.`booking_id` | 예약 참조 |
| `payment_method` | `VARCHAR(50)` | | 결제 수단 (e.g., "신용카드") |
| `amount` | `DECIMAL(10, 2)` | NOT NULL | 결제 금액 |
| `status` | `ENUM('pending', 'completed', 'failed', 'refunded')` | DEFAULT 'pending' | 결제 상태 |
| `transaction_id` | `VARCHAR(255)` | | 외부 결제사 거래 ID |
| `paid_at` | `TIMESTAMP` | | 결제 완료 일시 |
| `created_at` | `TIMESTAMP` | DEFAULT CURRENT_TIMESTAMP | 생성일시 |

### `settlements` (정산)
- 서비스 기사에 대한 정산 내역을 관리합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
| --- | --- | --- | --- |
| `settlement_id` | `INT` | PK, AUTO_INCREMENT | 정산 식별자 |
| `technician_id` | `INT` | NOT NULL, FK -> `technicians`.`technician_id` | 기사 참조 |
| `settlement_period` | `VARCHAR(50)` | NOT NULL | 정산 기간 (e.g., "2024-05") |
| `total_amount` | `DECIMAL(10, 2)` | NOT NULL | 총 서비스 금액 |
| `commission_fee` | `DECIMAL(10, 2)` | NOT NULL | 플랫폼 수수료 |
| `final_amount` | `DECIMAL(10, 2)` | NOT NULL | 최종 정산액 |
| `status` | `ENUM('pending', 'completed')` | DEFAULT 'pending' | 정산 상태 |
| `completed_at` | `TIMESTAMP` | | 정산 완료 일시 |
| `created_at` | `TIMESTAMP` | DEFAULT CURRENT_TIMESTAMP | 생성일시 |

---

## 5. 서비스 기록 및 리뷰 관리
**[시나리오 연관성]**
- **고객**: 완료된 서비스에 대한 후기를 작성하고, 다른 고객의 후기를 조회하여 기사 선택에 참고합니다.
- **서비스 기사**: 서비스 완료 후, 작업 전/후 사진을 포함한 작업 보고서를 작성하여 고객 신뢰도를 높입니다.
- **관리자**: 작성된 후기를 모니터링하고, 부적절한 콘텐츠를 관리합니다.

### `service_reports` (작업 보고서)
- 서비스 완료 후 기사가 작성하는 보고서입니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
| --- | --- | --- | --- |
| `report_id` | `INT` | PK, AUTO_INCREMENT | 보고서 식별자 |
| `booking_id` | `INT` | NOT NULL, FK -> `bookings`.`booking_id` | 예약 참조 |
| `summary` | `TEXT` | | 작업 요약 |
| `before_image_urls` | `JSON` | | 작업 전 사진 URL 목록 |
| `after_image_urls` | `JSON` | | 작업 후 사진 URL 목록 |
| `recommendations` | `TEXT` | | 추가 권장 사항 |
| `created_at` | `TIMESTAMP` | DEFAULT CURRENT_TIMESTAMP | 생성일시 |

### `reviews` (리뷰)
- 고객이 서비스에 대해 작성하는 리뷰 및 평점입니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
| --- | --- | --- | --- |
| `review_id` | `INT` | PK, AUTO_INCREMENT | 리뷰 식별자 |
| `booking_id` | `INT` | NOT NULL, FK -> `bookings`.`booking_id` | 예약 참조 |
| `customer_id` | `INT` | NOT NULL, FK -> `customers`.`customer_id` | 고객 참조 |
| `technician_id` | `INT` | NOT NULL, FK -> `technicians`.`technician_id` | 기사 참조 |
| `rating` | `INT` | NOT NULL, CHECK (`rating` BETWEEN 1 AND 5) | 평점 (1~5) |
| `comment` | `TEXT` | | 리뷰 내용 |
| `image_urls` | `JSON` | | 첨부 사진 URL 목록 |
| `is_public` | `BOOLEAN` | DEFAULT TRUE | 공개 여부 |
| `admin_response` | `TEXT` | | 관리자 답변 |
| `created_at` | `TIMESTAMP` | DEFAULT CURRENT_TIMESTAMP | 생성일시 |
| `updated_at` | `TIMESTAMP` | ON UPDATE CURRENT_TIMESTAMP | 수정일시 |

---

## 6. 마케팅 및 분석

### marketing_campaigns (마케팅 캠페인)
| 컬럼명           | 타입                            | 제약조건                                              | 설명                |
|------------------|---------------------------------|-------------------------------------------------------|---------------------|
| campaign_id      | INT                             | PK, AUTO_INCREMENT                                    | 캠페인 식별자       |
| campaign_name    | VARCHAR(200)                    | NOT NULL                                              | 캠페인 이름         |
| campaign_type    | ENUM('sms','email','kakao','push')| NOT NULL                                           | 캠페인 유형         |
| target_segment   | JSON                            |                                                       | 타겟 조건 (JSON)    |
| message_template | TEXT                            | NOT NULL                                              | 메시지 템플릿       |
| discount_code    | VARCHAR(50)                     |                                                       | 할인 코드           |
| discount_rate    | DECIMAL(5,2)                    |                                                       | 할인율 (%)          |
| start_date       | DATE                            |                                                       | 시작일              |
| end_date         | DATE                            |                                                       | 종료일              |
| status           | ENUM('draft','active','paused','completed')| DEFAULT 'draft'                             | 상태                |
| sent_count       | INT                             | DEFAULT 0                                            | 발송 횟수           |
| success_count    | INT                             | DEFAULT 0                                            | 성공 횟수           |
| conversion_count | INT                             | DEFAULT 0                                            | 전환 횟수           |
| created_at       | TIMESTAMP                       | DEFAULT CURRENT_TIMESTAMP                            | 생성일시           |
| updated_at       | TIMESTAMP                       | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP| 수정일시           |

### customer_segments (고객 세그먼트)
| 컬럼명              | 타입                            | 제약조건                                      | 설명              |
|---------------------|---------------------------------|-----------------------------------------------|-------------------|
| segment_id          | INT                             | PK, AUTO_INCREMENT                            | 세그먼트 식별자  |
| customer_id         | INT                             | NOT NULL, FK -> customers.customer_id         | 고객 참조        |
| segment_type        | ENUM('new','regular','vip','inactive','lost')|                                          | 세그먼트 유형    |
| last_service_date   | DATE                            |                                              | 마지막 서비스 일자|
| total_bookings      | INT                             | DEFAULT 0                                    | 총 예약 횟수     |
| total_spent         | DECIMAL(10,2)                   | DEFAULT 0                                    | 총 지출 금액     |
| avg_rating          | DECIMAL(3,2)                    |                                              | 평균 평점        |
| preferred_service_time| VARCHAR(20)                  |                                              | 선호 서비스 시간|
| marketing_responsiveness| ENUM('high','medium','low') |                                          | 마케팅 반응도    |
| updated_at          | TIMESTAMP                       | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP| 수정일시    |

### notifications (알림 관리)
| 컬럼명             | 타입                            | 제약조건                                      | 설명              |
|--------------------|---------------------------------|-----------------------------------------------|-------------------|
| notification_id    | INT                             | PK, AUTO_INCREMENT                            | 알림 식별자     |
| customer_id        | INT                             | FK -> customers.customer_id                   | 고객 참조       |
| notification_type  | ENUM('booking_reminder','service_complete','marketing','maintenance_due')| | 알림 유형  |
| message            | TEXT                            | NOT NULL                                     | 메시지          |
| send_method        | ENUM('sms','email','kakao','push')|                                           | 전송 수단       |
| scheduled_time     | TIMESTAMP                       |                                              | 예약 발송 시각  |
| sent_time          | TIMESTAMP                       | NULL                                        | 발송 완료 시각  |
| status             | ENUM('pending','sent','failed')| DEFAULT 'pending'                            | 상태           |
| created_at         | TIMESTAMP                       | DEFAULT CURRENT_TIMESTAMP                    | 생성일시       |

---
## 7. 시스템 설정

### system_settings (시스템 설정)
| 컬럼명           | 타입                              | 제약조건                                        | 설명             |
|------------------|-----------------------------------|-------------------------------------------------|------------------|
| setting_id       | INT                               | PK, AUTO_INCREMENT                              | 설정 식별자      |
| setting_key      | VARCHAR(100)                      | UNIQUE, NOT NULL                                 | 설정 키          |
| setting_value    | TEXT                              |                                                 | 설정 값          |
| setting_type     | ENUM('string','number','boolean','json')| DEFAULT 'string'                         | 값 유형          |
| description      | TEXT                              |                                                 | 설명             |
| is_public        | BOOLEAN                           | DEFAULT FALSE                                   | 공개 여부        |
| updated_by       | INT                               | FK -> users.user_id                             | 수정자          |
| updated_at       | TIMESTAMP                         | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP| 수정일시    |

### audit_logs (감사 로그)
| 컬럼명         | 타입                        | 제약조건                                            | 설명              |
|----------------|-----------------------------|-----------------------------------------------------|-------------------|
| log_id         | INT                         | PK, AUTO_INCREMENT                                  | 로그 식별자      |
| user_id        | INT                         | FK -> users.user_id                                 | 사용자 참조      |
| action         | VARCHAR(100)                | NOT NULL                                            | 작업              |
| table_name     | VARCHAR(50)                 |                                                     | 테이블명          |
| record_id      | INT                         |                                                     | 레코드 식별자     |
| old_values     | JSON                        |                                                     | 이전 값           |
| new_values     | JSON                        |                                                     | 새로운 값         |
| ip_address     | VARCHAR(45)                 |                                                     | IP 주소           |
| user_agent     | TEXT                        |                                                     | 사용자 에이전트   |
| created_at     | TIMESTAMP                   | DEFAULT CURRENT_TIMESTAMP                            | 생성일시         |

---
## 📊 주요 기능별 활용 방안

### 🎯 타겟 마케팅 활용
```sql
-- 예시: 6개월 이상 서비스 받지 않은 VIP 고객 조회
SELECT c.*, cs.last_service_date 
FROM customers c 
JOIN customer_segments cs ON c.customer_id = cs.customer_id 
WHERE cs.segment_type = 'vip' 
  AND cs.last_service_date < DATE_SUB(NOW(), INTERVAL 6 MONTH);
```

### 📈 관리자 대시보드 데이터
```sql
-- 월별 매출 통계
SELECT 
  DATE_FORMAT(booking_date, '%Y-%m') AS month,
  COUNT(*) AS total_bookings,
  SUM(total_price) AS total_revenue
FROM bookings 
WHERE status = 'completed' 
GROUP BY month 
ORDER BY month DESC;
```
