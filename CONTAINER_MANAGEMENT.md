# 🎛️ Mission Clean App - 컨테이너 관리 가이드

## 📋 개요
Mission Clean App의 컨테이너 모니터링, 배포, 관리를 위한 완전한 도구 모음입니다.
**개발환경과 프로덕션환경을 자동으로 감지**하여 적절한 설정을 적용합니다.

## 🚀 관리 도구 목록

### 1. **deploy.sh** - 완전한 배포
```bash
./deploy.sh
```
**용도**: 처음 배포 또는 완전한 재설치
**특징**:
- ✅ SSL 인증서 자동 발급/갱신
- ✅ 전체 인프라 설정 (Nginx, 데이터베이스 등)
- ✅ 소스코드 완전 재빌드 (`--build` 옵션)
- ✅ 환경변수 검증 (PostgreSQL, JWT, SMS 등)
- ✅ 11단계 단계별 배포 진행
- ✅ 실시간 헬스체크
- ⏱️ 소요시간: 10-15분

### 2. **redeploy.sh** - 빠른 재배포
```bash
./redeploy.sh
```
**용도**: 소스코드 변경 후 빠른 적용
**특징**:
- ✅ 애플리케이션 서비스만 재빌드 (backend, frontend)
- ✅ SSL/Nginx 중단 없이 유지
- ✅ 데이터베이스 유지 (데이터 보존)
- ✅ 기존 이미지 정리 후 새로 빌드
- ⏱️ 소요시간: 3-5분

### 3. **manage.sh** - CLI 관리 도구
```bash
./manage.sh [명령어] [옵션]
```
**용도**: 명령줄 기반 완전한 관리
**특징**:
- 🔍 **환경 자동 감지** (개발/프로덕션)
- 📊 상태 모니터링
- 🔧 서비스 제어
- 🛠️ 시스템 관리
- 📋 로그 확인

#### 주요 명령어:
```bash
# 📊 모니터링
./manage.sh status        # 서비스 상태 확인
./manage.sh monitor       # 실시간 모니터링
./manage.sh health        # 헬스체크 확인
./manage.sh logs [서비스] # 로그 확인

# 🔧 제어
./manage.sh start [서비스]   # 서비스 시작
./manage.sh stop [서비스]    # 서비스 정지
./manage.sh restart [서비스] # 서비스 재시작

# 🛠️ 유지보수
./manage.sh cleanup      # 시스템 정리
./manage.sh backup       # DB 백업 (프로덕션만)
./manage.sh update       # 이미지 업데이트
```

### 4. **dashboard.sh** - 인터랙티브 대시보드
```bash
./dashboard.sh
```
**용도**: GUI 기반 인터랙티브 관리
**특징**:
- 🎛️ 메뉴 기반 인터페이스
- 📊 실시간 상태 표시
- 🔍 실시간 모니터링 (q로 종료)
- 🔧 직관적인 서비스 제어

## 🔧 환경별 자동 설정

### 개발환경 감지 시:
- **파일**: `docker-compose.dev.yml`
- **서비스**: db, backend, frontend
- **컨테이너**: mission-clean-*-dev

### 프로덕션환경 감지 시:
- **파일**: `docker-compose.prod.yml`
- **서비스**: db, backend, frontend, nginx, certbot
- **컨테이너**: mission-clean-*

## 📊 모니터링 기능

### 1. 서비스 상태 확인
```bash
./manage.sh status
```
**출력 정보**:
- Docker Compose 서비스 목록
- 컨테이너별 상태 (실행중/정지됨/없음)
- 헬스체크 상태 (정상/이상/시작중/없음)
- 실시간 리소스 사용량 (CPU, 메모리, 네트워크)
- Docker 디스크 사용량

### 2. 실시간 모니터링
```bash
./manage.sh monitor
```
**기능**:
- 5초마다 자동 업데이트
- 컨테이너 상태 실시간 표시
- 리소스 사용량 실시간 추적
- 헬스체크 상태 모니터링
- Ctrl+C로 종료

### 3. 헬스체크 상세 정보
```bash
./manage.sh health
```
**제공 정보**:
- 각 서비스별 헬스체크 상태
- 실패 시 상세 오류 메시지
- 컨테이너 시작 시간
- 서비스 가용성 상태

## 🔧 서비스 제어 기능

### 전체 서비스 제어
```bash
./manage.sh start           # 모든 서비스 시작
./manage.sh stop            # 모든 서비스 정지
./manage.sh restart         # 모든 서비스 재시작
```

### 개별 서비스 제어
```bash
./manage.sh start backend      # 백엔드만 시작
./manage.sh stop frontend     # 프론트엔드만 정지
./manage.sh restart nginx     # Nginx만 재시작
```

### 지원되는 서비스:
- **db**: PostgreSQL 데이터베이스
- **backend**: Node.js API 서버
- **frontend**: React 프론트엔드
- **nginx**: Nginx 웹서버 (프로덕션만)
- **certbot**: SSL 인증서 관리 (프로덕션만)

## 📋 로그 모니터링

### 전체 로그 확인
```bash
./manage.sh logs
```

### 개별 서비스 로그 확인
```bash
./manage.sh logs backend    # 백엔드 로그만
./manage.sh logs frontend   # 프론트엔드 로그만
./manage.sh logs nginx      # Nginx 로그만
```

**기능**:
- 실시간 로그 스트리밍 (`-f` 옵션)
- Ctrl+C로 종료
- 컬러 출력 지원

## 🛠️ 시스템 관리

### 시스템 정리
```bash
./manage.sh cleanup
```
**수행 작업**:
- 사용하지 않는 컨테이너 삭제
- 사용하지 않는 이미지 삭제
- 사용하지 않는 네트워크 삭제
- 사용하지 않는 볼륨 삭제
- 정리 후 디스크 사용량 표시

### 데이터베이스 백업 (프로덕션만)
```bash
./manage.sh backup
```
**기능**:
- PostgreSQL 데이터베이스 완전 백업
- `./backups/` 디렉토리에 저장
- 파일명: `mission_clean_backup_YYYYMMDD_HHMMSS.sql`
- 백업 성공/실패 상태 표시

### 이미지 업데이트
```bash
./manage.sh update
```
**수행 작업**:
- 최신 이미지 다운로드 (`docker-compose pull`)
- 서비스 재시작 (`--force-recreate`)
- 업데이트 상태 표시

## 🎯 사용 시나리오

### 🆕 처음 배포하는 경우
```bash
./deploy.sh
```

### 🔄 소스코드만 변경한 경우
```bash
git pull
./redeploy.sh
```

### 📊 서비스 상태 확인
```bash
./manage.sh status
```

### 🔍 실시간 모니터링
```bash
./manage.sh monitor
# 또는 대시보드 사용
./dashboard.sh
```

### 🚨 문제 발생 시
```bash
# 1. 상태 확인
./manage.sh status

# 2. 로그 확인
./manage.sh logs [문제된_서비스]

# 3. 서비스 재시작
./manage.sh restart [문제된_서비스]

# 4. 전체 재시작 (필요시)
./manage.sh restart
```

### 🧹 정기 유지보수
```bash
# 시스템 정리
./manage.sh cleanup

# 백업 (프로덕션)
./manage.sh backup

# 이미지 업데이트
./manage.sh update
```

## 🔍 실시간 대시보드 사용법

```bash
./dashboard.sh
```

**메뉴 구성**:
1. 📊 서비스 상태 확인
2. 🔍 실시간 모니터링 (q로 종료)
3. 🏥 헬스체크 상태
4. 📋 로그 확인
5. 🔧 서비스 제어
6. 🛠️ 시스템 관리
0. 🚪 종료

**특징**:
- 환경 자동 감지 및 표시
- 컬러 UI 지원
- 키보드 네비게이션
- 실시간 업데이트

## ⚠️ 주의사항

### 권한 요구사항
- Docker 명령어 실행 권한 필요
- 프로덕션 환경에서는 sudo 권한 필요할 수 있음

### 포트 충돌 확인
- 개발환경: 3000(frontend), 3001(backend), 5432(db)
- 프로덕션: 80(http), 443(https), 5432(db)

### 백업 정책
- 정기적인 데이터베이스 백업 권장
- `./backups/` 디렉토리 정기 정리 필요

## 🚀 성능 최적화 팁

1. **리소스 모니터링**
   ```bash
   ./manage.sh monitor
   ```

2. **정기적인 시스템 정리**
   ```bash
   ./manage.sh cleanup
   ```

3. **로그 크기 관리**
   ```bash
   # 특정 서비스 로그만 확인
   ./manage.sh logs backend
   ```

4. **선택적 서비스 재시작**
   ```bash
   # 전체 재시작 대신 필요한 서비스만
   ./manage.sh restart backend
   ```

## 🎉 결론

이제 Mission Clean App의 **완전한 컨테이너 관리 시스템**이 구축되었습니다!

**개발에서 배포까지 원활한 워크플로우**:
1. 코드 수정 → `git push`
2. 서버에서 `git pull`
3. `./redeploy.sh` (빠른 재배포)
4. `./manage.sh status` (상태 확인)
5. `./manage.sh monitor` (실시간 모니터링)

**안정적이고 효율적인 운영 환경**이 완성되었습니다! 🚀 