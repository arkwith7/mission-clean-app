#!/bin/bash

# SSL 인증서 자동 갱신 스크립트
echo "🔄 SSL 인증서 갱신을 시작합니다..."

cd /path/to/your/mission-clean-app

# 인증서 갱신 시도
docker-compose run --rm certbot renew

# 갱신이 성공했으면 Nginx 리로드
if [ $? -eq 0 ]; then
    echo "✅ SSL 인증서가 갱신되었습니다. Nginx를 리로드합니다..."
    docker-compose exec nginx nginx -s reload
else
    echo "ℹ️  SSL 인증서 갱신이 필요하지 않거나 실패했습니다."
fi

echo "🏁 SSL 인증서 갱신 프로세스가 완료되었습니다." 