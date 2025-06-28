-- Mission Clean App PostgreSQL 초기화 스크립트
-- 데이터베이스와 기본 설정을 초기화합니다

-- 데이터베이스 생성 (이미 존재할 수 있지만 확인차 포함)
SELECT 'CREATE DATABASE mission_clean_dev' 
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mission_clean_dev');

-- 연결을 mission_clean_dev로 변경
\c mission_clean_dev;

-- 한국어 지원을 위한 기본 설정
SET client_encoding = 'UTF8';
SET timezone = 'Asia/Seoul';

-- 기본 확장 프로그램 설치 (UUID 지원)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 로그 기록
DO $$
BEGIN
    RAISE NOTICE 'Mission Clean Database 초기화 완료 - %', NOW();
END
$$; 