# Node.js 18 Alpine 이미지 사용
FROM node:18-alpine

# curl 설치 (헬스체크용)
RUN apk add --no-cache curl

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production

# 애플리케이션 코드 복사
COPY . .

# SQLite 데이터베이스 디렉토리 권한 설정
RUN mkdir -p /app/data && chmod 755 /app/data

# 포트 노출
EXPOSE 3001

# 비루트 사용자 생성 및 권한 설정
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# 애플리케이션 시작
CMD ["node", "server.js"] 