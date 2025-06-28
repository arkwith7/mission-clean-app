#!/bin/bash

API_BASE_URL="http://localhost:3001/api"

echo "🎯 테스트 예약 데이터 30건 생성을 시작합니다..."
echo ""

# 테스트 데이터 배열
names=("김철수" "이영희" "박민수" "최수정" "정대현" "한지민" "오성우" "임수빈" "송현정" "장민호" "윤서영" "조현우" "강민지" "신동욱" "류지현" "문서진" "홍길동" "전지현" "배현진" "노민수" "서울시" "김민정" "이현우" "박지영" "최동욱" "정수빈" "한예슬" "오지훈" "임민지" "송현우")

phones=("010-1234-5678" "010-2345-6789" "010-3456-7890" "010-4567-8901" "010-5678-9012" "010-6789-0123" "010-7890-1234" "010-8901-2345" "010-9012-3456" "010-0123-4567" "010-1357-9246" "010-2468-1357" "010-3691-4702" "010-4815-9260" "010-5926-3701" "010-6037-4815" "010-7148-5926" "010-8259-6037" "010-9370-7148" "010-0481-8259" "010-1592-9370" "010-2603-0481" "010-3714-1592" "010-4825-2603" "010-5936-3714" "010-6047-4825" "010-7158-5936" "010-8269-6047" "010-9380-7158" "010-0491-8269")

addresses=("서울시 강남구 테헤란로 123" "부산시 해운대구 마린시티 456" "대구시 수성구 범어동 789" "인천시 연수구 송도동 321" "광주시 서구 치평동 654" "대전시 유성구 장동 987" "울산시 남구 삼산동 147" "세종시 한솔동 258" "경기도 성남시 분당구 정자동 369" "경기도 수원시 영통구 영통동 741" "경기도 고양시 일산동구 백석동 852" "경기도 안양시 동안구 평촌동 963" "강원도 춘천시 효자동 159" "충북 청주시 서원구 사직동 267" "충남 천안시 동남구 신부동 378" "전북 전주시 완산구 서신동 489" "전남 광주시 북구 중앙로 591" "경북 대구시 달서구 성서동 612" "경남 창원시 의창구 팔용동 723" "제주시 제주시 연동 834" "서울시 서초구 서초동 945" "서울시 송파구 잠실동 156" "서울시 마포구 홍대입구역 267" "서울시 종로구 명동 378" "부산시 부산진구 서면 489" "대구시 중구 동성로 591" "인천시 중구 차이나타운 612" "광주시 동구 충장로 723" "대전시 중구 은행동 834" "울산시 중구 성남동 945")

service_types=("벽걸이형" "스탠드형" "시스템1way" "시스템4way" "실외기")

times=("morning" "afternoon" "evening" "consultation")

messages=("빠른 서비스 부탁드립니다." "주말 방문 가능한지 확인해주세요." "애완동물이 있어서 미리 알려드립니다." "오후 3시 이후 방문 부탁드립니다." "1층이라 접근이 쉽습니다." "주차 공간이 협소합니다." "에어컨 소음이 심해서 점검 부탁드립니다." "정기 청소 서비스입니다." "이사 전 마지막 청소입니다." "신규 설치 후 첫 청소입니다." "" "문의사항 있으면 연락주세요." "가격 상담도 함께 부탁드립니다." "다른 업체와 비교 중입니다." "추천받아서 연락드립니다.")

# 랜덤 선택 함수
get_random_item() {
    local arr=("$@")
    local len=${#arr[@]}
    local index=$((RANDOM % len))
    echo "${arr[$index]}"
}

# 미래 날짜 생성 (7-30일 후)
get_future_date() {
    local days_ahead=$((7 + RANDOM % 23))  # 7-30일 후
    date -d "+${days_ahead} days" +%Y-%m-%d
}

success_count=0
error_count=0

# 30건의 예약 데이터 생성
for i in {0..29}; do
    name="${names[$i]}"
    phone="${phones[$i]}"
    address=$(get_random_item "${addresses[@]}")
    service_type=$(get_random_item "${service_types[@]}")
    preferred_date=$(get_future_date)
    preferred_time=$(get_random_item "${times[@]}")
    message=$(get_random_item "${messages[@]}")
    
    # JSON 데이터 생성
    json_data=$(cat <<EOF
{
  "name": "$name",
  "phone": "$phone", 
  "address": "$address",
  "serviceType": "$service_type",
  "preferredDate": "$preferred_date",
  "preferredTime": "$preferred_time",
  "message": "$message"
}
EOF
)
    
    # API 호출
    response=$(curl -s -w "%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d "$json_data" \
        "$API_BASE_URL/bookings")
    
    http_code="${response: -3}"
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        ((success_count++))
        echo "✅ [$((i+1))/30] 예약 생성 성공: $name ($phone)"
    else
        ((error_count++))
        echo "❌ [$((i+1))/30] 예약 생성 실패: $name - HTTP $http_code"
    fi
    
    # API 부하 방지를 위한 딜레이
    sleep 0.1
done

echo ""
echo "📊 테스트 데이터 생성 완료!"
echo "✅ 성공: ${success_count}건"
echo "❌ 실패: ${error_count}건"
echo "📈 총 예약 건수: $((success_count + error_count))건"
echo ""

if [ $success_count -gt 0 ]; then
    echo "🎉 이제 관리자 대시보드에서 페이지네이션을 테스트할 수 있습니다!"
    echo "🔗 http://localhost:3000/admin/dashboard"
fi 