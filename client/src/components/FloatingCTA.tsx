import { useState, useEffect } from 'react'

interface FloatingCTAProps {
  onInquiryClick: () => void
}

const FloatingCTA = ({ onInquiryClick }: FloatingCTAProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isHiddenByUser, setIsHiddenByUser] = useState(false)
  const [isInContactSection, setIsInContactSection] = useState(false)

  useEffect(() => {
    // LocalStorage에서 사용자가 숨겼는지 확인
    const userHidden = localStorage.getItem('floatingCTA-hidden') === 'true'
    setIsHiddenByUser(userHidden)
  }, [])

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    // ContactSection 감지용 Intersection Observer
    const contactSection = document.getElementById('contact')
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInContactSection(entry.isIntersecting)
      },
      {
        threshold: 0.3, // ContactSection의 30%가 보일 때 감지
        rootMargin: '-100px 0px' // 상단 100px 마진으로 조기 감지
      }
    )

    if (contactSection) {
      observer.observe(contactSection)
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => {
      window.removeEventListener('scroll', toggleVisibility)
      if (contactSection) {
        observer.unobserve(contactSection)
      }
    }
  }, [])

  const handleClose = () => {
    setIsHiddenByUser(true)
    localStorage.setItem('floatingCTA-hidden', 'true')
  }

  const handleRestore = () => {
    setIsHiddenByUser(false)
    localStorage.removeItem('floatingCTA-hidden')
  }

  // 숨김 조건: 사용자가 숨겼거나, 스크롤이 부족하거나, ContactSection이 보일 때
  if (!isVisible || isHiddenByUser || isInContactSection) {
    // 사용자가 숨겼을 때만 복원 버튼 표시
    if (isHiddenByUser && isVisible && !isInContactSection) {
      return (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={handleRestore}
            className="bg-gray-600 hover:bg-gray-700 text-white rounded-full p-3 shadow-lg transition-all"
            title="플로팅 메뉴 복원"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      )
    }
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex flex-col space-y-3">
        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={handleClose}
            className="bg-gray-500 hover:bg-gray-600 text-white rounded-full p-2 shadow-lg transition-all hover:scale-110 opacity-80 hover:opacity-100"
            title="플로팅 메뉴 숨기기"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Phone Inquiry Button */}
        <button
          onClick={onInquiryClick}
          className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-full p-4 shadow-xl hover:shadow-2xl transition-all transform hover:scale-110"
          title="예약문의"
        >
          <div className="flex items-center">
            <span className="text-2xl">📞</span>
            <span className="ml-2 font-bold text-white whitespace-nowrap">
              예약문의
            </span>
          </div>
        </button>

        {/* Booking Button */}
        <button
          onClick={onInquiryClick}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-full p-4 shadow-xl hover:shadow-2xl transition-all transform hover:scale-110"
          title="예약하기"
        >
          <div className="flex items-center">
            <span className="text-2xl">📝</span>
            <span className="ml-2 font-bold text-white whitespace-nowrap">
              예약하기
            </span>
          </div>
        </button>

        {/* Quick Info */}
        <div className="bg-white border-2 border-teal-200 rounded-xl p-4 shadow-xl text-center text-sm max-w-xs">
          <div className="text-teal-700 font-bold mb-1">🔥 7월 특가</div>
          <div className="text-slate-700 font-semibold">20% 할인</div>
          <div className="text-cyan-600 text-xs font-medium">대전 중구 +10% 추가할인</div>
        </div>

        {/* Helper Text for Mobile */}
        <div className="block md:hidden bg-yellow-100 border border-yellow-300 rounded-lg p-2 text-xs text-yellow-800 text-center max-w-xs">
          💡 폼 작성 시 자동 숨김
        </div>
      </div>
    </div>
  )
}

export default FloatingCTA
