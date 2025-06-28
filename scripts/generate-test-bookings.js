#!/usr/bin/env node

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// 테스트 데이터 세트
const testData = {
  names: [
    '김철수', '이영희', '박민수', '최수정', '정대현', '한지민', '오성우', '임수빈',
    '송현정', '장민호', '윤서영', '조현우', '강민지', '신동욱', '류지현', '문서진',
    '홍길동', '전지현', '배현진', '노민수', '서울시', '김민정', '이현우', '박지영',
    '최동욱', '정수빈', '한예슬', '오지훈', '임민지', '송현우', '장서영', '윤민호'
  ],
  
  phones: [
    '010-1234-5678', '010-2345-6789', '010-3456-7890', '010-4567-8901',
    '010-5678-9012', '010-6789-0123', '010-7890-1234', '010-8901-2345',
    '010-9012-3456', '010-0123-4567', '010-1357-9246', '010-2468-1357',
    '010-3691-4702', '010-4815-9260', '010-5926-3701', '010-6037-4815',
    '010-7148-5926', '010-8259-6037', '010-9370-7148', '010-0481-8259',
    '010-1592-9370', '010-2603-0481', '010-3714-1592', '010-4825-2603',
    '010-5936-3714', '010-6047-4825', '010-7158-5936', '010-8269-6047',
    '010-9380-7158', '010-0491-8269'
  ],
  
  addresses: [
    '서울시 강남구 테헤란로 123', '부산시 해운대구 마린시티 456',
    '대구시 수성구 범어동 789', '인천시 연수구 송도동 321',
    '광주시 서구 치평동 654', '대전시 유성구 장동 987',
    '울산시 남구 삼산동 147', '세종시 한솔동 258',
    '경기도 성남시 분당구 정자동 369', '경기도 수원시 영통구 영통동 741',
    '경기도 고양시 일산동구 백석동 852', '경기도 안양시 동안구 평촌동 963',
    '강원도 춘천시 효자동 159', '충북 청주시 서원구 사직동 267',
    '충남 천안시 동남구 신부동 378', '전북 전주시 완산구 서신동 489',
    '전남 광주시 북구 중앙로 591', '경북 대구시 달서구 성서동 612',
    '경남 창원시 의창구 팔용동 723', '제주시 제주시 연동 834',
    '서울시 서초구 서초동 945', '서울시 송파구 잠실동 156',
    '서울시 마포구 홍대입구역 267', '서울시 종로구 명동 378',
    '부산시 부산진구 서면 489', '대구시 중구 동성로 591',
    '인천시 중구 차이나타운 612', '광주시 동구 충장로 723',
    '대전시 중구 은행동 834', '울산시 중구 성남동 945'
  ],
  
  serviceTypes: [
    '벽걸이형', '스탠드형', '시스템1way', '시스템4way', '실외기'
  ],
  
  times: ['morning', 'afternoon', 'evening', 'consultation'],
  
  statuses: ['pending', 'confirmed', 'completed', 'cancelled'],
  
  messages: [
    '빠른 서비스 부탁드립니다.',
    '주말 방문 가능한지 확인해주세요.',
    '애완동물이 있어서 미리 알려드립니다.',
    '오후 3시 이후 방문 부탁드립니다.',
    '1층이라 접근이 쉽습니다.',
    '주차 공간이 협소합니다.',
    '에어컨 소음이 심해서 점검 부탁드립니다.',
    '정기 청소 서비스입니다.',
    '이사 전 마지막 청소입니다.',
    '신규 설치 후 첫 청소입니다.',
    '',
    '문의사항 있으면 연락주세요.',
    '가격 상담도 함께 부탁드립니다.',
    '다른 업체와 비교 중입니다.',
    '추천받아서 연락드립니다.'
  ]
};

// 랜덤 날짜 생성 (최근 2개월)
function getRandomDate() {
  const now = new Date();
  const twoMonthsAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000)); // 60일 전
  const randomTime = twoMonthsAgo.getTime() + Math.random() * (now.getTime() - twoMonthsAgo.getTime());
  return new Date(randomTime).toISOString().split('T')[0];
}

// 미래 서비스 날짜 생성
function getFutureServiceDate() {
  const now = new Date();
  const futureDate = new Date(now.getTime() + Math.random() * (30 * 24 * 60 * 60 * 1000)); // 앞으로 30일 내
  return futureDate.toISOString().split('T')[0];
}

// 랜덤 선택 함수
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// 예약 데이터 생성
async function generateBookings() {
  console.log('🎯 테스트 예약 데이터 30건 생성을 시작합니다...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < 30; i++) {
    const bookingData = {
      name: getRandomItem(testData.names),
      phone: testData.phones[i], // 중복 방지를 위해 순서대로
      address: getRandomItem(testData.addresses),
      serviceType: getRandomItem(testData.serviceTypes),
      preferredDate: getFutureServiceDate(),
      preferredTime: getRandomItem(testData.times),
      message: getRandomItem(testData.messages)
    };
    
    try {
      const response = await axios.post(`${API_BASE_URL}/bookings`, bookingData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      successCount++;
      console.log(`✅ [${i + 1}/30] 예약 생성 성공: ${bookingData.name} (${bookingData.phone})`);
      
      // API 부하 방지를 위한 딜레이
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      errorCount++;
      console.error(`❌ [${i + 1}/30] 예약 생성 실패: ${bookingData.name}`, error.response?.data?.error || error.message);
    }
  }
  
  console.log('\n📊 테스트 데이터 생성 완료!');
  console.log(`✅ 성공: ${successCount}건`);
  console.log(`❌ 실패: ${errorCount}건`);
  console.log(`📈 총 예약 건수: ${successCount + errorCount}건\n`);
  
  if (successCount > 0) {
    console.log('🎉 이제 관리자 대시보드에서 페이지네이션을 테스트할 수 있습니다!');
    console.log('🔗 http://localhost:3000/admin/dashboard');
  }
}

// 스크립트 실행
if (require.main === module) {
  generateBookings().catch(console.error);
}

module.exports = { generateBookings }; 