import React from 'react';

interface PrivacyConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
  type: 'booking' | 'sms';
}

const PrivacyConsentModal: React.FC<PrivacyConsentModalProps> = ({
  isOpen,
  onClose,
  onAgree,
  type
}) => {
  if (!isOpen) return null;

  const getDescription = () => {
    return type === 'booking' 
      ? '에어컨 청소 예약 접수, 서비스 제공, 고객 상담'
      : 'SMS 문의 접수, 상담 서비스 제공, 고객 응대';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* 헤더 */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              🔒 개인정보 수집·이용 동의서
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 동의서 내용 */}
          <div className="space-y-6 text-sm">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-bold text-blue-800 mb-2">📋 개인정보 수집·이용 내역</h3>
              <div className="space-y-3 text-blue-700">
                <div>
                  <span className="font-semibold">수집 목적:</span> {getDescription()}
                </div>
                <div>
                  <span className="font-semibold">수집 항목:</span> 이름, 연락처(휴대폰), 주소
                  {type === 'booking' && ', 서비스 종류, 희망 날짜/시간'}
                  {type === 'sms' && ', 문의 내용'}
                </div>
                <div>
                  <span className="font-semibold">보유 기간:</span> 서비스 완료 후 1년
                </div>
                <div>
                  <span className="font-semibold">처리 근거:</span> 정보주체의 동의 (개인정보보호법 제15조)
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-3">1. 개인정보 수집·이용 목적</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>{type === 'booking' ? '에어컨 청소 예약 접수 및 관리' : 'SMS 문의 접수 및 상담'}</li>
                <li>서비스 제공 및 계약 이행</li>
                <li>고객 상담 및 불만 처리</li>
                <li>서비스 품질 향상을 위한 연락</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-3">2. 수집하는 개인정보 항목</h4>
              <div className="space-y-2">
                <div>
                  <span className="font-semibold text-gray-700">필수 항목:</span>
                  <ul className="list-disc list-inside ml-4 text-gray-600">
                    <li>이름 (서비스 대상자 식별)</li>
                    <li>연락처 (예약 확인 및 상담)</li>
                    <li>주소 (서비스 제공 장소)</li>
                    {type === 'booking' && (
                      <>
                        <li>서비스 종류 (맞춤형 서비스 제공)</li>
                        <li>희망 날짜/시간 (일정 조율)</li>
                      </>
                    )}
                    {type === 'sms' && <li>문의 내용 (상담 서비스 제공)</li>}
                  </ul>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">선택 항목:</span>
                  <ul className="list-disc list-inside ml-4 text-gray-600">
                    <li>추가 요청사항 (서비스 품질 향상)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-3">3. 개인정보 보유 및 이용 기간</h4>
              <div className="text-gray-700 space-y-2">
                <p><span className="font-semibold">보유 기간:</span> 서비스 완료 후 1년</p>
                <p><span className="font-semibold">파기 시점:</span> 보유 기간 만료 즉시 또는 처리 목적 달성 시</p>
                <p className="text-sm text-gray-600">
                  ※ 관련 법령(전자상거래법, 소비자보호법 등)에 따라 일정 기간 보존이 필요한 경우 해당 기간 동안 보관
                </p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-3">4. 개인정보 처리 위탁</h4>
              <div className="text-gray-700">
                <p className="mb-2">고객 서비스 향상을 위해 아래와 같이 개인정보 처리를 위탁하고 있습니다.</p>
                <div className="bg-gray-50 p-3 rounded border">
                  <p><span className="font-semibold">수탁업체:</span> SMS 발송 서비스 업체</p>
                  <p><span className="font-semibold">위탁업무:</span> SMS 발송 서비스</p>
                  <p><span className="font-semibold">보유기간:</span> 위탁계약 종료 시까지</p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-3">5. 정보주체의 권리·의무 및 행사 방법</h4>
              <div className="text-gray-700 space-y-2">
                <p>고객께서는 언제든지 다음과 같은 권리를 행사하실 수 있습니다:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>개인정보 처리 현황 열람 요구</li>
                  <li>오류·누락이 있는 경우 정정·삭제 요구</li>
                  <li>개인정보 처리정지 요구</li>
                </ul>
                <p className="text-sm text-gray-600 mt-2">
                  권리 행사 방법: 전화(예약문의) 또는 이메일(info@aircleankorea.com)로 연락
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-bold text-yellow-800 mb-2">⚠️ 동의 거부권 및 불이익</h4>
              <div className="text-yellow-700 space-y-1">
                <p>• 개인정보 수집·이용에 동의하지 않으실 권리가 있습니다.</p>
                <p>• 다만, 필수 항목 미동의 시 {type === 'booking' ? '예약 서비스' : 'SMS 문의 서비스'} 이용이 제한될 수 있습니다.</p>
                <p>• 선택 항목은 미동의하셔도 서비스 이용에 제한이 없습니다.</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-bold text-green-800 mb-2">🔒 개인정보 보호 조치</h4>
              <div className="text-green-700 space-y-1 text-sm">
                <p>• 개인정보 암호화 저장 및 전송</p>
                <p>• 접근 권한 제한 및 접속 기록 관리</p>
                <p>• 개인정보 처리 직원 보안 교육</p>
                <p>• 정기적인 보안 점검 실시</p>
              </div>
            </div>
          </div>

          {/* 동의 버튼 */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              취소
            </button>
            <button
              onClick={onAgree}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              ✅ 동의하고 계속하기
            </button>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
            <p className="text-xs text-gray-600 text-center">
              본 동의서는 개인정보보호법에 근거하여 작성되었으며, 
              동의일로부터 위에 명시된 기간 동안 유효합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyConsentModal; 