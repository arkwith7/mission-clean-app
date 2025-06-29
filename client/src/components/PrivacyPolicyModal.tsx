import React from 'react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* 헤더 */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              🔐 개인정보처리방침
            </h1>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 기본 정보 */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-blue-800">시행일자:</span>
                <span className="text-blue-700 ml-2">2025년 6월 28일</span>
              </div>
              <div>
                <span className="font-semibold text-blue-800">개정일자:</span>
                <span className="text-blue-700 ml-2">2025년 6월 28일</span>
              </div>
              <div>
                <span className="font-semibold text-blue-800">버전:</span>
                <span className="text-blue-700 ml-2">v1.0</span>
              </div>
              <div>
                <span className="font-semibold text-blue-800">업체명:</span>
                <span className="text-blue-700 ml-2">Mission Clean</span>
              </div>
            </div>
          </div>

          {/* 처리방침 내용 */}
          <div className="space-y-8 text-sm">
            {/* 제1조 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                제1조 (개인정보의 처리목적)
              </h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  Mission Clean은 다음의 목적을 위하여 개인정보를 처리합니다.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h3 className="font-semibold mb-2">처리 목적</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>에어컨 청소 예약 접수 및 관리</li>
                    <li>고객 문의사항 처리 및 상담</li>
                    <li>서비스 제공 및 계약 이행</li>
                    <li>요금 정산 및 결제</li>
                    <li>고객 불만 처리 및 A/S</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 제2조 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                제2조 (개인정보의 처리 및 보유기간)
              </h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  회사는 정보주체로부터 개인정보를 수집할 때 동의 받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h3 className="font-semibold mb-2">보유기간</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>예약 및 서비스 제공 정보</span>
                      <span className="font-semibold">서비스 완료 후 1년</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>고객 문의 처리 정보</span>
                      <span className="font-semibold">문의 완료 후 1년</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 제3조 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                제3조 (개인정보의 처리항목)
              </h2>
              <div className="space-y-3 text-gray-700">
                <p>회사는 다음의 개인정보 항목을 처리하고 있습니다.</p>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="font-semibold mb-2">1. 예약 서비스 관련</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <span className="font-semibold text-green-700">필수항목:</span>
                        <ul className="list-disc list-inside ml-4 text-sm mt-1">
                          <li>이름</li>
                          <li>연락처 (휴대폰 번호)</li>
                          <li>서비스 주소</li>
                          <li>서비스 종류</li>
                        </ul>
                      </div>
                      <div>
                        <span className="font-semibold text-blue-700">선택항목:</span>
                        <ul className="list-disc list-inside ml-4 text-sm mt-1">
                          <li>희망 날짜/시간</li>
                          <li>추가 요청사항</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 제4조 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                제4조 (정보주체의 권리·의무 및 행사방법)
              </h2>
              <div className="space-y-3 text-gray-700">
                <p>정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.</p>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-2">권리 행사 방법</h3>
                  <div className="text-blue-700 space-y-1">
                    <p><span className="font-semibold">전화:</span> 예약문의 (웹사이트 예약 버튼 클릭)</p>
                    <p><span className="font-semibold">이메일:</span> info@aircleankorea.com</p>
                    <p><span className="font-semibold">주소:</span> 대전광역시 중구 동서대로 1435</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 제5조 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                제5조 (개인정보 보호책임자)
              </h2>
              <div className="space-y-3 text-gray-700">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h3 className="font-semibold mb-3">개인정보 보호책임자</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">성명:</span>
                      <span>개인정보보호책임자</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">연락처:</span>
                      <span>예약문의 (웹사이트 접수)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">이메일:</span>
                      <span>info@aircleankorea.com</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* 닫기 버튼 */}
          <div className="flex justify-center mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyModal; 