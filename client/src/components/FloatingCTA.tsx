import { useState, useEffect } from 'react'

const FloatingCTA = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex flex-col space-y-3">
        {/* Phone Call Button */}
        <a
          href="tel:010-9171-8465"
          className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-full p-4 shadow-xl hover:shadow-2xl transition-all transform hover:scale-110 group"
          title="전화걸기"
        >
          <div className="flex items-center">
            <span className="text-2xl">📞</span>
            <span className="ml-2 font-bold hidden group-hover:inline-block whitespace-nowrap">
              010-9171-8465
            </span>
          </div>
        </a>

        {/* Booking Button */}
        <button
          onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-full p-4 shadow-xl hover:shadow-2xl transition-all transform hover:scale-110 group"
          title="예약하기"
        >
          <div className="flex items-center">
            <span className="text-2xl">📝</span>
            <span className="ml-2 font-bold hidden group-hover:inline-block whitespace-nowrap">
              예약하기
            </span>
          </div>
        </button>

        {/* Quick Info */}
        <div className="bg-white border-2 border-teal-200 rounded-xl p-4 shadow-xl text-center text-sm max-w-xs">
          <div className="text-teal-700 font-bold mb-1">🔥 6월 특가</div>
          <div className="text-slate-700 font-semibold">20% 할인</div>
          <div className="text-cyan-600 text-xs font-medium">대전 중구 +10% 추가할인</div>
        </div>
      </div>
    </div>
  )
}

export default FloatingCTA
