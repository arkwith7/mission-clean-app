import { useEffect } from 'react'

interface InquiryModalProps {
  isOpen: boolean
  onClose: () => void
  onPhoneInquiry: () => void
  onSmsInquiry: () => void
}

const InquiryModal = ({ isOpen, onClose, onPhoneInquiry, onSmsInquiry }: InquiryModalProps) => {
  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      <div 
        className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">
              📞 예약문의 방법 선택
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            편하신 방법으로 문의해주세요
          </p>
        </div>

        {/* 옵션들 */}
        <div className="p-6 space-y-4">
          {/* 온라인 예약 옵션 */}
          <button
            onClick={onPhoneInquiry}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl p-6 transition-all transform hover:scale-105 shadow-lg"
          >
            <div className="flex items-center justify-center mb-3">
              <span className="text-3xl mr-3">📝</span>
              <div className="text-left">
                <h4 className="text-lg font-bold">온라인 예약 (추천)</h4>
                <p className="text-blue-100 text-sm">빠르고 정확한 예약</p>
              </div>
            </div>
            <ul className="text-blue-100 text-sm space-y-1">
              <li>• 즉시 예약 확정</li>
              <li>• CAPTCHA 보안 인증</li>
              <li>• 24시간 언제든 예약</li>
            </ul>
          </button>

          {/* 문자 메시지 옵션 */}
          <button
            onClick={onSmsInquiry}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl p-6 transition-all transform hover:scale-105 shadow-lg"
          >
            <div className="flex items-center justify-center mb-3">
              <span className="text-3xl mr-3">💬</span>
              <div className="text-left">
                <h4 className="text-lg font-bold">문자 메시지 문의</h4>
                <p className="text-green-100 text-sm">간편한 문자 상담</p>
              </div>
            </div>
            <ul className="text-green-100 text-sm space-y-1">
              <li>• 간단한 정보만 입력</li>
              <li>• 1시간 내 답변</li>
              <li>• 전화 통화 부담 없음</li>
            </ul>
          </button>

          {/* 직접 전화걸기 옵션 */}
          <div className="border-t border-gray-200 pt-4">
            <p className="text-center text-sm text-gray-600 mb-3 font-medium">
              🚨 급한 상담이 필요하신가요?
            </p>
            <a
              href="tel:010-9171-8465"
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl p-4 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
            >
              <span className="text-2xl mr-3">📞</span>
              <div className="text-center">
                <h4 className="text-lg font-bold">직접 전화상담</h4>
                <p className="text-orange-100 text-sm">터치하면 바로 연결</p>
              </div>
            </a>
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500">
                평일 9시-6시 • 주말/공휴일 상담 가능
              </p>
            </div>
          </div>

          {/* 추가 안내 */}
          <div className="mt-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800 font-semibold mb-1">
                💡 상담 방법별 특징
              </p>
              <div className="text-xs text-blue-700 space-y-1">
                <p>📝 온라인: 가장 정확하고 빠른 예약</p>
                <p>💬 문자: 1시간 내 답변, 통화 부담 없음</p>
                <p>📞 전화: 즉시 상담, 복잡한 문의 적합</p>
              </div>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
          <p className="text-center text-xs text-gray-500">
            24시간 상담 가능 • 대전 중구 +10% 추가할인
          </p>
        </div>
      </div>
    </div>
  )
}

export default InquiryModal 