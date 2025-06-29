#!/bin/bash

# Mission Clean App - 컨테이너 관리 도구
# 사용법: ./manage.sh [명령어]

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 환경 자동 감지 함수
detect_environment() {
    if docker ps -a --format "{{.Names}}" | grep -q "mission-clean.*-dev"; then
        echo "dev"
    elif docker ps -a --format "{{.Names}}" | grep -q "mission-clean-postgres\|mission-clean-backend\|mission-clean-frontend"; then
        echo "prod"
    else
        echo "none"
    fi
}

# 환경별 설정 함수
setup_environment() {
    local env=$1
    case $env in
        "dev")
            COMPOSE_FILE="docker-compose.dev.yml"
            SERVICES=("db" "backend" "frontend")
            SERVICE_CONTAINERS=("mission-clean-db-dev" "mission-clean-backend-dev" "mission-clean-frontend-dev")
            ENV_NAME="개발환경"
            ;;
        "prod")
            COMPOSE_FILE="docker-compose.prod.yml"
            SERVICES=("db" "backend" "frontend" "nginx" "certbot")
            SERVICE_CONTAINERS=("mission-clean-postgres" "mission-clean-backend" "mission-clean-frontend" "mission-clean-nginx" "mission-clean-certbot")
            ENV_NAME="프로덕션환경"
            ;;
        *)
            echo -e "${RED}❌ 실행 중인 Mission Clean App 컨테이너를 찾을 수 없습니다.${NC}"
            echo -e "${YELLOW}💡 다음 중 하나를 실행해주세요:${NC}"
            echo -e "  ${CYAN}개발환경: docker-compose -f docker-compose.dev.yml up -d${NC}"
            echo -e "  ${CYAN}프로덕션: ./deploy.sh${NC}"
            exit 1
            ;;
    esac
}

# 환경 감지 및 설정
ENVIRONMENT=$(detect_environment)
setup_environment "$ENVIRONMENT"

# 도움말 표시
show_help() {
    echo -e "${BLUE}🎛️  Mission Clean App - 컨테이너 관리 도구${NC}"
    echo -e "${BLUE}=========================================${NC}"
    echo -e "${PURPLE}현재 환경: $ENV_NAME${NC}"
    echo -e "${PURPLE}컴포즈 파일: $COMPOSE_FILE${NC}"
    echo ""
    echo -e "${GREEN}📊 모니터링:${NC}"
    echo -e "  ${CYAN}./manage.sh status${NC}        - 서비스 상태 확인"
    echo -e "  ${CYAN}./manage.sh monitor${NC}       - 실시간 모니터링"
    echo -e "  ${CYAN}./manage.sh health${NC}        - 헬스체크 확인"
    echo -e "  ${CYAN}./manage.sh logs [서비스]${NC}  - 로그 확인"
    echo ""
    echo -e "${GREEN}🔧 제어:${NC}"
    echo -e "  ${CYAN}./manage.sh start [서비스]${NC} - 서비스 시작"
    echo -e "  ${CYAN}./manage.sh stop [서비스]${NC}  - 서비스 정지"
    echo -e "  ${CYAN}./manage.sh restart [서비스]${NC} - 서비스 재시작"
    echo ""
    echo -e "${GREEN}🛠️  유지보수:${NC}"
    echo -e "  ${CYAN}./manage.sh cleanup${NC}       - 시스템 정리"
    echo -e "  ${CYAN}./manage.sh backup${NC}        - DB 백업"
    echo -e "  ${CYAN}./manage.sh update${NC}        - 이미지 업데이트"
    echo ""
    echo -e "${GREEN}📋 서비스 목록:${NC}"
    echo -e "  ${YELLOW}db${NC}       - PostgreSQL 데이터베이스"
    echo -e "  ${YELLOW}backend${NC}  - Node.js API 서버"
    echo -e "  ${YELLOW}frontend${NC} - React 프론트엔드"
    echo -e "  ${YELLOW}nginx${NC}    - Nginx 웹서버"
    echo -e "  ${YELLOW}certbot${NC}  - SSL 인증서 관리"
    echo ""
    echo -e "${GREEN}사용 예시:${NC}"
    echo -e "  ${CYAN}./manage.sh status${NC}            # 전체 상태 확인"
    echo -e "  ${CYAN}./manage.sh logs backend${NC}      # 백엔드 로그 확인"
    echo -e "  ${CYAN}./manage.sh restart frontend${NC}  # 프론트엔드 재시작"
    echo -e "  ${CYAN}./manage.sh monitor${NC}           # 실시간 모니터링"
    echo ""
}

# 서비스 상태 확인
check_status() {
    echo -e "${BLUE}📊 서비스 상태 확인 ($ENV_NAME)${NC}"
    echo -e "${BLUE}================================${NC}"
    
    echo -e "\n${GREEN}🐳 Docker Compose 서비스:${NC}"
    docker-compose -f $COMPOSE_FILE ps
    
    echo -e "\n${GREEN}📦 컨테이너 상세 정보:${NC}"
    printf "%-20s %-15s %-10s %-15s\n" "서비스" "컨테이너" "상태" "헬스체크"
    echo "────────────────────────────────────────────────────────────────"
    
    for i in "${!SERVICES[@]}"; do
        service="${SERVICES[$i]}"
        container="${SERVICE_CONTAINERS[$i]}"
        
        if docker ps --format "{{.Names}}" | grep -q "^$container$"; then
            status="🟢 실행중"
            health=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "없음")
            case $health in
                "healthy") health="🟢 정상" ;;
                "unhealthy") health="🔴 이상" ;;
                "starting") health="🟡 시작중" ;;
                *) health="➖ 없음" ;;
            esac
        elif docker ps -a --format "{{.Names}}" | grep -q "^$container$"; then
            status="🔴 정지됨"
            health="➖ 없음"
        else
            status="⚪ 없음"
            health="➖ 없음"
        fi
        
        printf "%-20s %-15s %-10s %-15s\n" "$service" "$container" "$status" "$health"
    done
    
    echo -e "\n${GREEN}💻 리소스 사용량:${NC}"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" | head -6
    
    echo -e "\n${GREEN}💾 디스크 사용량:${NC}"
    docker system df
}

# 실시간 모니터링
monitor_services() {
    echo -e "${BLUE}📊 실시간 모니터링 (Ctrl+C로 종료)${NC}"
    
    trap 'echo -e "\n${YELLOW}모니터링 종료${NC}"; exit 0' INT
    
    while true; do
        clear
        echo -e "${PURPLE}🎛️  Mission Clean App - 실시간 모니터링${NC}"
        echo -e "${PURPLE}$ENV_NAME - $(date '+%Y-%m-%d %H:%M:%S')${NC}"
        echo -e "${PURPLE}========================================${NC}"
        
        echo -e "\n${GREEN}📦 컨테이너 상태:${NC}"
        docker-compose -f $COMPOSE_FILE ps
        
        echo -e "\n${GREEN}💻 리소스 사용량:${NC}"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" | head -6
        
        echo -e "\n${GREEN}🏥 헬스체크:${NC}"
        for container in "${SERVICE_CONTAINERS[@]}"; do
            if docker ps --format "{{.Names}}" | grep -q "^$container$"; then
                health=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "없음")
                case $health in
                    "healthy") echo -e "  $container: 🟢 정상" ;;
                    "unhealthy") echo -e "  $container: 🔴 이상" ;;
                    "starting") echo -e "  $container: 🟡 시작중" ;;
                    *) echo -e "  $container: ➖ 없음" ;;
                esac
            fi
        done
        
        echo -e "\n${CYAN}5초 후 업데이트... (Ctrl+C로 종료)${NC}"
        sleep 5
    done
}

# 헬스체크 상태 확인
check_health() {
    echo -e "${BLUE}🏥 헬스체크 상태${NC}"
    echo -e "${BLUE}=================${NC}"
    
    for i in "${!SERVICES[@]}"; do
        service="${SERVICES[$i]}"
        container="${SERVICE_CONTAINERS[$i]}"
        
        echo -e "\n${YELLOW}📋 $service ($container):${NC}"
        
        if docker ps --format "{{.Names}}" | grep -q "^$container$"; then
            health=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "없음")
            
            case $health in
                "healthy")
                    echo -e "  상태: 🟢 정상"
                    ;;
                "unhealthy")
                    echo -e "  상태: 🔴 이상"
                    health_log=$(docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' "$container" 2>/dev/null | tail -1)
                    echo -e "  오류: $health_log"
                    ;;
                "starting")
                    echo -e "  상태: 🟡 시작중"
                    ;;
                *)
                    echo -e "  상태: ➖ 헬스체크 없음"
                    ;;
            esac
            
            uptime=$(docker inspect --format='{{.State.StartedAt}}' "$container" 2>/dev/null | cut -c 1-19 || echo "알 수 없음")
            echo -e "  시작: $uptime"
        else
            echo -e "  상태: 🔴 컨테이너 없음"
        fi
    done
}

# 로그 확인
show_logs() {
    local service=$1
    
    if [ -z "$service" ]; then
        echo -e "${BLUE}📋 전체 로그 (Ctrl+C로 종료)${NC}"
        docker-compose -f $COMPOSE_FILE logs -f
    else
        if [[ " ${SERVICES[@]} " =~ " ${service} " ]]; then
            echo -e "${BLUE}📋 $service 로그 (Ctrl+C로 종료)${NC}"
            docker-compose -f $COMPOSE_FILE logs -f "$service"
        else
            echo -e "${RED}❌ 잘못된 서비스: $service${NC}"
            echo -e "${CYAN}사용 가능: ${SERVICES[*]}${NC}"
            exit 1
        fi
    fi
}

# 서비스 시작
start_service() {
    local service=$1
    
    if [ -z "$service" ]; then
        echo -e "${BLUE}🚀 전체 서비스 시작${NC}"
        docker-compose -f $COMPOSE_FILE up -d
        echo -e "${GREEN}✅ 모든 서비스 시작됨${NC}"
    else
        if [[ " ${SERVICES[@]} " =~ " ${service} " ]]; then
            echo -e "${BLUE}🚀 $service 시작${NC}"
            docker-compose -f $COMPOSE_FILE up -d "$service"
            echo -e "${GREEN}✅ $service 시작됨${NC}"
        else
            echo -e "${RED}❌ 잘못된 서비스: $service${NC}"
            exit 1
        fi
    fi
}

# 서비스 정지
stop_service() {
    local service=$1
    
    if [ -z "$service" ]; then
        echo -e "${BLUE}🛑 전체 서비스 정지${NC}"
        docker-compose -f $COMPOSE_FILE down
        echo -e "${GREEN}✅ 모든 서비스 정지됨${NC}"
    else
        if [[ " ${SERVICES[@]} " =~ " ${service} " ]]; then
            echo -e "${BLUE}🛑 $service 정지${NC}"
            docker-compose -f $COMPOSE_FILE stop "$service"
            echo -e "${GREEN}✅ $service 정지됨${NC}"
        else
            echo -e "${RED}❌ 잘못된 서비스: $service${NC}"
            exit 1
        fi
    fi
}

# 서비스 재시작
restart_service() {
    local service=$1
    
    if [ -z "$service" ]; then
        echo -e "${BLUE}🔄 전체 서비스 재시작${NC}"
        docker-compose -f $COMPOSE_FILE restart
        echo -e "${GREEN}✅ 모든 서비스 재시작됨${NC}"
    else
        if [[ " ${SERVICES[@]} " =~ " ${service} " ]]; then
            echo -e "${BLUE}🔄 $service 재시작${NC}"
            docker-compose -f $COMPOSE_FILE restart "$service"
            echo -e "${GREEN}✅ $service 재시작됨${NC}"
        else
            echo -e "${RED}❌ 잘못된 서비스: $service${NC}"
            exit 1
        fi
    fi
}

# 시스템 정리
cleanup_system() {
    echo -e "${BLUE}🧹 시스템 정리${NC}"
    echo -e "${YELLOW}🗑️  컨테이너 정리...${NC}"
    docker container prune -f
    echo -e "${YELLOW}🗑️  이미지 정리...${NC}"
    docker image prune -f
    echo -e "${YELLOW}🗑️  네트워크 정리...${NC}"
    docker network prune -f
    echo -e "${YELLOW}🗑️  볼륨 정리...${NC}"
    docker volume prune -f
    echo -e "${GREEN}✅ 정리 완료${NC}"
    docker system df
}

# 데이터베이스 백업
backup_database() {
    echo -e "${BLUE}💾 데이터베이스 백업${NC}"
    
    local backup_dir="./backups"
    local backup_file="mission_clean_backup_$(date +%Y%m%d_%H%M%S).sql"
    
    mkdir -p "$backup_dir"
    
    if docker ps --format "{{.Names}}" | grep -q "^mission-clean-postgres$"; then
        echo -e "${YELLOW}📦 백업 중...${NC}"
        docker exec mission-clean-postgres pg_dump -U postgres mission_clean_dev > "$backup_dir/$backup_file"
        echo -e "${GREEN}✅ 백업 완료: $backup_dir/$backup_file${NC}"
    else
        echo -e "${RED}❌ PostgreSQL 컨테이너 없음${NC}"
        exit 1
    fi
}

# 이미지 업데이트
update_images() {
    echo -e "${BLUE}🔄 이미지 업데이트${NC}"
    echo -e "${YELLOW}📥 이미지 다운로드...${NC}"
    docker-compose -f $COMPOSE_FILE pull
    echo -e "${YELLOW}🔄 재시작...${NC}"
    docker-compose -f $COMPOSE_FILE up -d --force-recreate
    echo -e "${GREEN}✅ 업데이트 완료${NC}"
}

# 메인 함수
main() {
    case "${1:-help}" in
        "status") check_status ;;
        "monitor") monitor_services ;;
        "health") check_health ;;
        "logs") show_logs "$2" ;;
        "start") start_service "$2" ;;
        "stop") stop_service "$2" ;;
        "restart") restart_service "$2" ;;
        "cleanup") cleanup_system ;;
        "backup") backup_database ;;
        "update") update_images ;;
        "help"|"-h"|"--help") show_help ;;
        *)
            echo -e "${RED}❌ 알 수 없는 명령어: $1${NC}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# 스크립트 실행
main "$@" 