# Mission Clean 앱 Docker 배포 가이드

이 가이드는 Mission Clean 애플리케이션을 Docker를 사용하여 HTTPS와 함께 프로덕션 서버에 배포하는 방법을 설명합니다.

## 시스템 요구사항

- Docker Engine 20.10+
- Docker Compose 2.0+
- 도메인 이름 (DNS가 서버 IP로 설정되어 있어야 함)
- 80, 443 포트가 열려있는 서버

## 컨테이너 구성

1. **Backend**: Node.js Express API 서버
2. **Frontend**: React 애플리케이션 (Nginx로 서빙)
3. **Nginx**: 리버스 프록시 및 HTTPS 터미네이션
4. **Certbot**: Let's Encrypt SSL 인증서 자동 관리

## 배포 단계

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

### 2. 프로젝트 클론 및 설정

```bash
git clone <repository-url> mission-clean-app
cd mission-clean-app

# 환경 변수 설정
export DOMAIN=aircleankorea.com
export EMAIL=your-email@example.com
```

### 3. 자동 배포 실행

```bash
./scripts/deploy.sh
```

### 4. 수동 배포 (선택사항)

```bash
# 1. 필요한 디렉토리 생성
mkdir -p certbot/conf certbot/www

# 2. 도메인 설정 업데이트
sed -i "s/aircleankorea.com/$DOMAIN/g" nginx/conf.d/default.conf
sed -i "s/your-email@example.com/$EMAIL/g" docker-compose.yml

# 3. Docker 이미지 빌드
docker-compose build

# 4. HTTP 모드로 초기 시작
docker-compose up -d nginx backend frontend

# 5. SSL 인증서 획득
docker-compose run --rm certbot certonly --webroot -w /var/www/certbot --email $EMAIL --agree-tos --no-eff-email -d $DOMAIN -d www.$DOMAIN

# 6. HTTPS 모드로 재시작
docker-compose down
docker-compose up -d
```

## SSL 인증서 자동 갱신

crontab에 다음 항목을 추가하여 SSL 인증서를 자동으로 갱신:

```bash
# crontab 편집
crontab -e

# 매일 오전 2시에 인증서 갱신 확인
0 2 * * * /path/to/mission-clean-app/scripts/ssl-renew.sh >> /var/log/ssl-renew.log 2>&1
```

## 백업

정기적인 데이터 백업을 위해 crontab에 백업 스크립트 추가:

```bash
# 매일 오전 3시에 백업 실행
0 3 * * * /path/to/mission-clean-app/scripts/backup.sh >> /var/log/backup.log 2>&1
```

## 모니터링 및 관리

### 컨테이너 상태 확인

```bash
docker-compose ps
docker-compose logs -f [service-name]
```

### 서비스 재시작

```bash
# 전체 서비스 재시작
docker-compose restart

# 특정 서비스만 재시작
docker-compose restart nginx
docker-compose restart backend
docker-compose restart frontend
```

### 업데이트 배포

```bash
# 새 코드 가져오기
git pull origin main

# 이미지 재빌드 및 배포
docker-compose build
docker-compose up -d
```

## 보안 고려사항

1. **방화벽 설정**: 필요한 포트 (80, 443)만 열어두기
2. **정기 업데이트**: Docker 이미지와 시스템 패키지 정기 업데이트
3. **로그 모니터링**: 비정상적인 접근 시도 모니터링
4. **백업 검증**: 정기적으로 백업 파일의 무결성 확인

## 트러블슈팅

### SSL 인증서 획득 실패

```bash
# DNS 설정 확인
nslookup aircleankorea.com

# 도메인 접근 확인
curl -I http://aircleankorea.com/.well-known/acme-challenge/test

# Certbot 로그 확인
docker-compose logs certbot
```

### 컨테이너 시작 실패

```bash
# 로그 확인
docker-compose logs [service-name]

# 컨테이너 상태 확인
docker ps -a

# 디스크 공간 확인
df -h
```

## 유용한 명령어

```bash
# 전체 로그 실시간 확인
docker-compose logs -f

# 데이터베이스 백업
docker-compose exec backend sqlite3 /app/mission_clean.sqlite ".backup /app/backup.sqlite"

# SSL 인증서 수동 갱신
docker-compose run --rm certbot renew

# 컨테이너 리소스 사용량 확인
docker stats
```

## 접속 URL

- **웹사이트**: https://aircleankorea.com
- **API 문서**: https://aircleankorea.com/api-docs
- **API 엔드포인트**: https://aircleankorea.com/api/ 