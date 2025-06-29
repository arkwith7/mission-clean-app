# Node.js 18 Alpine 이미지 사용
FROM node:18-alpine

# 필요한 시스템 패키지 설치 (curl과 wget for healthcheck)
RUN apk add --no-cache curl wget

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치 (dev dependencies 제외)
RUN npm ci --only=production && npm cache clean --force

# 애플리케이션 코드 복사
COPY . .

# 데이터 디렉토리 생성 및 권한 설정
RUN mkdir -p /app/data && chmod 755 /app/data

# 로그 디렉토리 생성 및 모든 권한 부여
RUN mkdir -p /app/logs && chmod 777 /app/logs

# 비루트 사용자 생성 및 권한 설정
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app && \
    chown -R nodejs:nodejs /app/logs

# 포트 노출
EXPOSE 3001

# 사용자 변경
USER nodejs

# 애플리케이션 시작
CMD ["node", "server.js"] 