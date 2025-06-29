#!/bin/bash

# Mission Clean App - 인터랙티브 대시보드
set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# 환경 자동 감지
detect_environment() {
    if docker ps -a --format "{{.Names}}" | grep -q "mission-clean.*-dev"; then
        echo "dev"
    elif docker ps -a --format "{{.Names}}" | grep -q "mission-clean-postgres\|mission-clean-backend\|mission-clean-frontend"; then
        echo "prod"
    else
        echo "none"
    fi
}

# 환경별 설정
setup_environment() {
    local env=$1
    
    case $env in
        "dev")
            COMPOSE_FILE="docker-compose.dev.yml"
            SERVICES=("db" "backend" "frontend")
            CONTAINERS=("mission-clean-db-dev" "mission-clean-backend-dev" "mission-clean-frontend-dev")
            ENV_NAME="개발환경"
            ;;
        "prod")
            COMPOSE_FILE="docker-compose.prod.yml"
            SERVICES=("db" "backend" "frontend" "nginx" "certbot")
            CONTAINERS=("mission-clean-postgres" "mission-clean-backend" "mission-clean-frontend" "mission-clean-nginx" "mission-clean-certbot")
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

# 화면 지우기 및 헤더 표시
clear_and_header() {
    clear
    echo -e "${PURPLE}${BOLD}┌─────────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${PURPLE}${BOLD}│              🎛️  Mission Clean App Dashboard                  │${NC}"
    echo -e "${PURPLE}${BOLD}│                     $ENV_NAME                                  │${NC}"
    echo -e "${PURPLE}${BOLD}│                $(date '+%Y-%m-%d %H:%M:%S')                    │${NC}"
    echo -e "${PURPLE}${BOLD}└─────────────────────────────────────────────────────────────────┘${NC}"
    echo ""
}

# 메인 메뉴 표시
show_main_menu() {
    echo -e "${GREEN}${BOLD}📋 메인 메뉴${NC}"
    echo -e "${GREEN}─────────────${NC}"
    echo -e "  ${CYAN}1.${NC} 📊 서비스 상태 확인"
    echo -e "  ${CYAN}2.${NC} 🔍 실시간 모니터링"
    echo -e "  ${CYAN}3.${NC} 🏥 헬스체크 상태"
    echo -e "  ${CYAN}4.${NC} 📋 로그 확인"
    echo -e "  ${CYAN}5.${NC} 🔧 서비스 제어"
    echo -e "  ${CYAN}6.${NC} 🛠️  시스템 관리"
    echo -e "  ${CYAN}0.${NC} 🚪 종료"
    echo ""
    echo -e "${YELLOW}메뉴를 선택하세요 (0-6): ${NC}"
}

# 서비스 상태 확인
show_service_status() {
    clear_and_header
    echo -e "${BLUE}${BOLD}📊 서비스 상태 확인${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    printf "\n${GREEN}%-15s %-25s %-12s %-12s${NC}\n" "서비스" "컨테이너" "상태" "헬스체크"
    echo -e "${GREEN}──────────────────────────────────────────────────────────────────────${NC}"
    
    for i in "${!SERVICES[@]}"; do
        service="${SERVICES[$i]}"
        container="${CONTAINERS[$i]}"
        
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
        
        printf "%-15s %-25s %-12s %-12s\n" "$service" "$container" "$status" "$health"
    done
    
    echo -e "\n${GREEN}${BOLD}💻 리소스 사용량${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" | head -5
    
    echo -e "\n${CYAN}아무 키나 누르면 메인 메뉴로 돌아갑니다...${NC}"
    read -n 1 -s
}

# 실시간 모니터링
start_monitoring() {
    clear_and_header
    echo -e "${BLUE}${BOLD}🔍 실시간 모니터링 (q를 누르면 종료)${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    while true; do
        echo -e "\n${PURPLE}⏰ 업데이트: $(date '+%H:%M:%S')${NC}"
        
        echo -e "\n${GREEN}📦 컨테이너 상태:${NC}"
        docker-compose -f $COMPOSE_FILE ps 2>/dev/null | head -10
        
        echo -e "\n${GREEN}💻 실시간 리소스:${NC}"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" | head -6
        
        if read -t 3 -n 1 key; then
            if [[ $key == "q" || $key == "Q" ]]; then
                break
            fi
        fi
        
        clear_and_header
        echo -e "${BLUE}${BOLD}🔍 실시간 모니터링 (q를 누르면 종료)${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    done
}

# 서비스 제어 메뉴
show_control_menu() {
    clear_and_header
    echo -e "${BLUE}${BOLD}🔧 서비스 제어${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    echo -e "\n${GREEN}제어 옵션:${NC}"
    echo -e "  ${CYAN}1.${NC} 🚀 전체 서비스 시작"
    echo -e "  ${CYAN}2.${NC} 🛑 전체 서비스 정지"
    echo -e "  ${CYAN}3.${NC} 🔄 전체 서비스 재시작"
    echo -e "  ${CYAN}0.${NC} 🔙 메인 메뉴로"
    
    echo -e "\n${YELLOW}옵션을 선택하세요 (0-3): ${NC}"
    read -r choice
    
    case $choice in
        1)
            echo -e "\n${BLUE}🚀 전체 서비스 시작 중...${NC}"
            docker-compose -f $COMPOSE_FILE up -d
            echo -e "${GREEN}✅ 완료!${NC}"
            ;;
        2)
            echo -e "\n${BLUE}🛑 전체 서비스 정지 중...${NC}"
            docker-compose -f $COMPOSE_FILE down
            echo -e "${GREEN}✅ 완료!${NC}"
            ;;
        3)
            echo -e "\n${BLUE}🔄 전체 서비스 재시작 중...${NC}"
            docker-compose -f $COMPOSE_FILE restart
            echo -e "${GREEN}✅ 완료!${NC}"
            ;;
        0)
            return
            ;;
    esac
    
    echo -e "\n${CYAN}아무 키나 누르면 계속...${NC}"
    read -n 1 -s
}

# 메인 대시보드 루프
main_dashboard() {
    while true; do
        clear_and_header
        show_main_menu
        
        read -r choice
        
        case $choice in
            1) show_service_status ;;
            2) start_monitoring ;;
            3) echo -e "${YELLOW}헬스체크 기능은 개발 중입니다.${NC}"; sleep 2 ;;
            4) echo -e "${YELLOW}로그 기능은 개발 중입니다.${NC}"; sleep 2 ;;
            5) show_control_menu ;;
            6) echo -e "${YELLOW}시스템 관리 기능은 개발 중입니다.${NC}"; sleep 2 ;;
            0) 
                echo -e "\n${GREEN}👋 Mission Clean App Dashboard를 종료합니다.${NC}"
                exit 0
                ;;
            *)
                echo -e "\n${RED}❌ 잘못된 선택입니다. 다시 선택해주세요.${NC}"
                sleep 2
                ;;
        esac
    done
}

# 메인 실행
main() {
    ENVIRONMENT=$(detect_environment)
    setup_environment "$ENVIRONMENT"
    main_dashboard
}

main "$@"
