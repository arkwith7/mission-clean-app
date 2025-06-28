#!/bin/bash

echo "🔍 === SSL 인증서 문제 진단 스크립트 ==="
echo ""

# 1. 도메인 DNS 확인
echo "🌐 DNS 확인:"
echo "aircleankorea.com → $(dig +short aircleankorea.com)"
echo "www.aircleankorea.com → $(dig +short www.aircleankorea.com)"
echo "현재 서버 공인 IP: $(curl -s ifconfig.me)"
echo ""

# 2. 포트 80 접근 확인
echo "🔌 포트 80 접근 테스트:"
echo "내부에서 테스트:"
curl -I http://localhost:80 2>/dev/null | head -1 || echo "❌ 내부 접근 실패"

echo "외부에서 테스트:"
timeout 5 curl -I http://aircleankorea.com 2>/dev/null | head -1 || echo "❌ 외부 접근 실패 (방화벽/보안그룹 문제 가능성)"
echo ""

# 3. Nginx 상태 확인
echo "🔧 Nginx 상태:"
docker-compose -f docker-compose.prod.yml ps nginx
echo ""

echo "📝 Nginx 로그 (최근 20줄):"
docker-compose -f docker-compose.prod.yml logs nginx --tail=20
echo ""

# 4. Nginx 설정 확인
echo "⚙️  Nginx 설정 파일 확인:"
if [ -f "./nginx/nginx.conf" ]; then
    echo "✅ nginx.conf 존재"
    grep -n "server_name\|listen\|location.*well-known" ./nginx/nginx.conf || echo "❌ SSL 관련 설정 없음"
else
    echo "❌ nginx.conf 파일이 없습니다"
fi
echo ""

if [ -d "./nginx/conf.d" ]; then
    echo "conf.d 디렉토리 내용:"
    ls -la ./nginx/conf.d/
    echo ""
    
    for conf_file in ./nginx/conf.d/*.conf; do
        if [ -f "$conf_file" ]; then
            echo "=== $conf_file ==="
            cat "$conf_file"
            echo ""
        fi
    done
else
    echo "❌ nginx/conf.d 디렉토리가 없습니다"
fi
echo ""

# 5. Certbot 볼륨 확인
echo "📁 Certbot 볼륨 확인:"
docker run --rm -v mission-clean-app_certbot-www:/var/www/certbot alpine ls -la /var/www/certbot/ || echo "❌ certbot-www 볼륨 확인 실패"
echo ""

# 6. 방화벽 확인
echo "🛡️  방화벽 상태:"
sudo ufw status 2>/dev/null || echo "ufw 비활성화 또는 권한 없음"
echo ""

# 7. 포트 사용 확인
echo "🔌 포트 사용 현황:"
netstat -tulpn | grep -E ":80|:443" || ss -tulpn | grep -E ":80|:443" || echo "netstat/ss 명령어 없음"
echo ""

# 8. AWS 보안 그룹 확인 (AWS CLI가 있는 경우)
echo "☁️  AWS 보안 그룹 확인:"
if command -v aws &> /dev/null; then
    instance_id=$(curl -s http://169.254.169.254/latest/meta-data/instance-id 2>/dev/null)
    if [ ! -z "$instance_id" ]; then
        echo "인스턴스 ID: $instance_id"
        aws ec2 describe-instances --instance-ids $instance_id --query 'Reservations[0].Instances[0].SecurityGroups[*].GroupId' --output text 2>/dev/null || echo "AWS CLI 권한 없음"
    fi
else
    echo "AWS CLI 없음 - 수동으로 보안 그룹 확인 필요"
fi
echo ""

echo "🛠️  === 추천 해결 방법 ==="
echo "1. AWS 보안 그룹에서 포트 80, 443 열기"
echo "2. nginx 설정에 .well-known 경로 추가"
echo "3. 도메인 DNS가 현재 서버 IP를 가리키는지 확인"
echo "4. 임시로 self-signed 인증서 사용 고려"
echo ""