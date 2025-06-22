# 🗄️ Mission Clean 데이터베이스 설계

---

## 1. 사용자 및 권한 관리

### users (사용자 테이블)
| 컬럼명        | 타입                                    | 제약조건                                             | 설명            |
|---------------|-----------------------------------------|------------------------------------------------------|-----------------|
| user_id       | INT                                     | PK, AUTO_INCREMENT                                   | 사용자 식별자   |
| username      | VARCHAR(50)                             | UNIQUE, NOT NULL                                     | 사용자명        |
| email         | VARCHAR(100)                            | UNIQUE, NOT NULL                                     | 이메일          |
| password_hash | VARCHAR(255)                            | NOT NULL                                             | 비밀번호 해시   |
| role          | ENUM('admin','manager','customer')     | NOT NULL                                             | 사용자 역할     |
| status        | ENUM('active','inactive','suspended')  | DEFAULT 'active'                                     | 계정 상태       |
| created_at    | TIMESTAMP                               | DEFAULT CURRENT_TIMESTAMP                            | 생성일시        |
| updated_at    | TIMESTAMP                               | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP| 수정일시        |
| last_login    | TIMESTAMP                               | NULL                                                 | 마지막 로그인   |

### customers (고객 상세정보)
| 컬럼명               | 타입                                          | 제약조건                                                    | 설명               |
|----------------------|-----------------------------------------------|-------------------------------------------------------------|--------------------|
| customer_id          | INT                                           | PK, AUTO_INCREMENT                                          | 고객 식별자        |
| user_id              | INT                                           | NULL, FK -> users.user_id                                   | 연관된 사용자      |
| name                 | VARCHAR(100)                                  | NOT NULL                                                    | 고객 이름          |
| phone                | VARCHAR(20)                                   | NOT NULL                                                    | 연락처             |
| email                | VARCHAR(100)                                  |                                                             | 이메일             |
| address              | TEXT                                          | NOT NULL                                                    | 주소               |
| detailed_address     | TEXT                                          |                                                             | 상세 주소          |
| age_group            | ENUM('20s','30s','40s','50s','60s+')          |                                                             | 연령대             |
| gender               | ENUM('male','female','other')                |                                                             | 성별               |
| customer_type        | ENUM('individual','business')                | DEFAULT 'individual'                                        | 고객 유형          |
| registration_source  | ENUM('website','phone','referral','marketing')| DEFAULT 'website'                                           | 등록 경로          |
| marketing_consent    | BOOLEAN                                       | DEFAULT FALSE                                              | 마케팅 동의        |
| sms_consent          | BOOLEAN                                       | DEFAULT FALSE                                              | SMS 수신 동의      |
| created_at           | TIMESTAMP                                     | DEFAULT CURRENT_TIMESTAMP                                   | 생성일시           |
| updated_at           | TIMESTAMP                                     | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP       | 수정일시           |

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

### services (서비스 종류)
| 컬럼명            | 타입                | 제약조건                                                  | 설명               |
|-------------------|---------------------|-----------------------------------------------------------|--------------------|
| service_id        | INT                 | PK, AUTO_INCREMENT                                        | 서비스 식별자      |
| service_name      | VARCHAR(100)        | NOT NULL                                                  | 서비스명           |
| description       | TEXT                |                                                           | 설명               |
| base_price        | DECIMAL(10,2)       | NOT NULL                                                  | 기본 가격          |
| duration_minutes  | INT                 | NOT NULL                                                  | 소요 시간 (분)     |
| service_type      | ENUM('basic','premium','maintenance')| NOT NULL                                | 서비스 유형        |
| includes          | TEXT                |                                                           | 포함 내용         |
| is_active         | BOOLEAN             | DEFAULT TRUE                                              | 활성 상태         |
| created_at        | TIMESTAMP           | DEFAULT CURRENT_TIMESTAMP                                 | 생성일시           |
| updated_at        | TIMESTAMP           | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP     | 수정일시           |

### bookings (예약)
| 컬럼명            | 타입                                     | 제약조건                                                        | 설명                |
|-------------------|------------------------------------------|-----------------------------------------------------------------|---------------------|
| booking_id        | INT                                      | PK, AUTO_INCREMENT                                              | 예약 식별자         |
| customer_id       | INT                                      | NOT NULL, FK -> customers.customer_id                           | 고객 참조           |
| service_id        | INT                                      | NOT NULL, FK -> services.service_id                             | 서비스 참조         |
| aircon_id         | INT                                      | FK -> customer_aircons.aircon_id                                | 고객 에어컨 참조   |
| booking_date      | DATE                                     | NOT NULL                                                        | 예약 날짜           |
| booking_time      | TIME                                     | NOT NULL                                                        | 예약 시간           |
| status            | ENUM('pending','confirmed','in_progress','completed','cancelled')| DEFAULT 'pending'             | 예약 상태           |
| total_price       | DECIMAL(10,2)                            |                                                                 | 총 금액             |
| discount_amount   | DECIMAL(10,2)                            | DEFAULT 0                                                       | 할인 금액           |
| payment_status    | ENUM('pending','paid','refunded')       | DEFAULT 'pending'                                               | 결제 상태           |
| payment_method    | ENUM('cash','card','transfer','kakao_pay')|                                                               | 결제 수단           |
| special_requests  | TEXT                                     |                                                                 | 요청 사항           |
| technician_notes  | TEXT                                     |                                                                 | 기술자 메모        |
| created_at        | TIMESTAMP                                | DEFAULT CURRENT_TIMESTAMP                                       | 생성일시           |
| updated_at        | TIMESTAMP                                | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP           | 수정일시           |

### service_records (서비스 완료 기록)
| 컬럼명               | 타입                                | 제약조건                                                  | 설명                  |
|----------------------|-------------------------------------|-----------------------------------------------------------|-----------------------|
| record_id            | INT                                 | PK, AUTO_INCREMENT                                        | 기록 식별자           |
| booking_id           | INT                                 | NOT NULL, FK -> bookings.booking_id                       | 예약 참조            |
| technician_name      | VARCHAR(100)                        |                                                           | 기술자 이름           |
| start_time           | TIMESTAMP                           |                                                           | 작업 시작 시각        |
| end_time             | TIMESTAMP                           |                                                           | 작업 종료 시각        |
| work_summary         | TEXT                                |                                                           | 작업 요약             |
| issues_found         | TEXT                                |                                                           | 이슈 내역             |
| recommendations      | TEXT                                |                                                           | 권장 사항             |
| parts_replaced       | TEXT                                |                                                           | 교체 부품             |
| next_service_date    | DATE                                |                                                           | 다음 서비스 예정일    |
| customer_satisfaction| INT                                 | CHECK (1 ≤ value ≤ 5)                                     | 고객 만족도           |
| created_at           | TIMESTAMP                           | DEFAULT CURRENT_TIMESTAMP                                   | 생성일시            |

---
## 4. 미디어 및 컨텐츠 관리

### media_files (미디어 파일)
| 컬럼명           | 타입                             | 제약조건                                            | 설명             |
|------------------|----------------------------------|-----------------------------------------------------|------------------|
| file_id          | INT                              | PK, AUTO_INCREMENT                                  | 파일 식별자      |
| filename         | VARCHAR(255)                     | NOT NULL                                            | 파일 이름       |
| original_filename| VARCHAR(255)                     |                                                     | 원본 파일 이름   |
| file_path        | VARCHAR(500)                     | NOT NULL                                            | 저장 경로        |
| file_type        | ENUM('image','video','document') | NOT NULL                                            | 파일 유형        |
| file_size        | INT                              |                                                     | 파일 크기 (바이트)|
| mime_type        | VARCHAR(100)                     |                                                     | MIME 타입       |
| uploaded_by      | INT                              | FK -> users.user_id                                 | 업로더           |
| upload_purpose   | ENUM('gallery','catalog','manual','profile','marketing')|                                     | 업로드 용도       |
| created_at       | TIMESTAMP                        | DEFAULT CURRENT_TIMESTAMP                            | 업로드 일시      |

### work_gallery (작업 갤러리)
| 컬럼명            | 타입            | 제약조건                                        | 설명               |
|-------------------|-----------------|-------------------------------------------------|---------------------|
| gallery_id        | INT             | PK, AUTO_INCREMENT                              | 갤러리 식별자       |
| record_id         | INT             | FK -> service_records.record_id                 | 서비스 기록 참조    |
| before_image_id   | INT             | FK -> media_files.file_id                       | 이전 이미지 참조    |
| after_image_id    | INT             | FK -> media_files.file_id                       | 이후 이미지 참조    |
| work_video_id     | INT             | FK -> media_files.file_id                       | 작업 비디오 참조    |
| title             | VARCHAR(200)    |                                                 | 제목                |
| description       | TEXT            |                                                 | 설명                |
| is_featured       | BOOLEAN         | DEFAULT FALSE                                   | 추천 여부           |
| is_public         | BOOLEAN         | DEFAULT TRUE                                    | 공개 여부           |
| tags              | VARCHAR(500)    |                                                 | 태그 (콤마 구분)     |
| created_at        | TIMESTAMP       | DEFAULT CURRENT_TIMESTAMP                       | 생성일시           |

---
## 5. 리뷰 및 피드백

### reviews (고객 리뷰)
| 컬럼명          | 타입                        | 제약조건                                               | 설명               |
|-----------------|-----------------------------|--------------------------------------------------------|--------------------|
| review_id       | INT                         | PK, AUTO_INCREMENT                                     | 리뷰 식별자        |
| customer_id     | INT                         | NOT NULL, FK -> customers.customer_id                  | 고객 참조          |
| booking_id      | INT                         | FK -> bookings.booking_id                              | 예약 참조          |
| rating          | INT                         | NOT NULL, CHECK (1 ≤ value ≤ 5)                        | 평점               |
| review_text     | TEXT                        |                                                        | 리뷰 텍스트        |
| review_photos   | TEXT                        |                                                        | 사진 ID 배열       |
| is_featured     | BOOLEAN                     | DEFAULT FALSE                                          | 추천 여부          |
| is_public       | BOOLEAN                     | DEFAULT TRUE                                           | 공개 여부          |
| admin_response  | TEXT                        |                                                        | 관리자 답변        |
| created_at      | TIMESTAMP                   | DEFAULT CURRENT_TIMESTAMP                              | 생성일시           |
| updated_at      | TIMESTAMP                   | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 수정일시           |

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
