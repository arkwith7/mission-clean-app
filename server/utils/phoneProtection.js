const crypto = require('crypto');

// 전화번호 마스킹 (중간 4자리 숨김)
const maskPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // 전화번호에서 숫자만 추출
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  if (cleanPhone.length === 11) {
    // 010-****-5678 형태로 마스킹
    return `${cleanPhone.slice(0, 3)}-****-${cleanPhone.slice(7)}`;
  }
  
  return phoneNumber;
};

// 보호된 연락처 정보 반환
const getProtectedContactInfo = () => {
  const basePhone = process.env.TECHNICIAN_PHONE || '010-9171-8465';
  
  return {
    displayNumber: maskPhoneNumber(basePhone),
    fullNumber: basePhone, // 실제 SMS 발송 등에 사용
    isProtected: true,
    message: '전체 번호는 예약 신청 후 SMS로 안내됩니다.'
  };
};

// 인증된 사용자에게만 전체 번호 제공
const getFullContactInfo = (userRole = 'customer') => {
  const basePhone = process.env.TECHNICIAN_PHONE || '010-9171-8465';
  
  // 관리자나 매니저만 전체 번호 조회 가능
  if (['admin', 'manager'].includes(userRole)) {
    return {
      displayNumber: basePhone,
      fullNumber: basePhone,
      isProtected: false
    };
  }
  
  return getProtectedContactInfo();
};

// 클라이언트용 안전한 연락처 API
const getSafeContactForClient = () => {
  return {
    display: '상담 및 예약',
    action: 'booking', // 예약 버튼으로 연결
    message: '아래 예약 양식을 작성해주시면 담당자가 직접 연락드립니다.'
  };
};

module.exports = {
  maskPhoneNumber,
  getProtectedContactInfo,
  getFullContactInfo,
  getSafeContactForClient
}; 