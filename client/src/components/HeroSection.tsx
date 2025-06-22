const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-100 pt-12 pb-20 lg:pt-16 lg:pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-block bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800 px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-sm border border-teal-200">
              🔥 6월 말까지 특가! 20% 할인
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl lg:text-6xl font-bold text-slate-800 mb-6 leading-tight">
              여름철 에어컨,<br />
              <span className="text-cyan-600">곰팡이와 냄새</span> 때문에<br />
              고민이세요?
            </h1>

            {/* Sub Headline */}
            <p className="text-xl lg:text-2xl text-slate-600 mb-8 leading-relaxed">
              Mission Clean의 전문 청소로<br />
              <span className="font-bold text-cyan-700">새것처럼 깨끗하게!</span>
            </p>

            {/* Service Area */}
            <div className="bg-white rounded-xl p-6 mb-8 shadow-lg border border-cyan-100">
              <div className="flex items-center justify-center lg:justify-start">
                <span className="text-cyan-600 text-xl">📍</span>
                <span className="ml-3 text-slate-700 font-bold text-lg">
                  대전 중구 중심 충청권 전 지역 서비스
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <a 
                href="tel:010-9171-8465"
                className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-8 py-5 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                📞 010-9171-8465 전화 상담
              </a>
              <button 
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-5 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                🎯 지금 20% 할인 예약하기
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-slate-600">
              <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm">
                <span className="text-emerald-500 text-lg">✓</span>
                <span className="ml-2 font-semibold">24시간 상담 가능</span>
              </div>
              <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm">
                <span className="text-emerald-500 text-lg">✓</span>
                <span className="ml-2 font-semibold">대전 전 지역 30분 내 출동</span>
              </div>
              <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm">
                <span className="text-emerald-500 text-lg">✓</span>
                <span className="ml-2 font-semibold">고객 만족도 98%</span>
              </div>
            </div>
          </div>

          {/* Right Content - Visual */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {/* Before/After Visual */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">청소 전후 비교</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                    <div className="text-red-500 text-3xl mb-2">😷</div>
                    <h4 className="font-semibold text-red-700 mb-2">청소 전</h4>
                    <ul className="text-sm text-red-600 space-y-1">
                      <li>• 곰팡이 냄새</li>
                      <li>• 검은 오염물질</li>
                      <li>• 냉방 효율 저하</li>
                      <li>• 전기료 증가</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <div className="text-green-500 text-3xl mb-2">😊</div>
                    <h4 className="font-semibold text-green-700 mb-2">청소 후</h4>
                    <ul className="text-sm text-green-600 space-y-1">
                      <li>• 상쾌한 공기</li>
                      <li>• 완벽한 청결</li>
                      <li>• 냉방 효율 향상</li>
                      <li>• 전기료 절약</li>
                    </ul>
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">500+</div>
                      <div className="text-sm text-gray-600">누적 서비스</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">98%</div>
                      <div className="text-sm text-gray-600">만족도</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">85%</div>
                      <div className="text-sm text-gray-600">재이용률</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold shadow-lg">
              -20%
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
