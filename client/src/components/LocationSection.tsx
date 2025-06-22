const LocationSection = () => {
  const serviceAreas = [
    {
      zone: "1차 권역",
      area: "대전 중구",
      time: "20분 내 즉시 출동",
      features: ["동서대로 본사 직접 출동", "대전역, 중앙로, 은행동", "추가 할인 10%"],
      color: "bg-green-50 border-green-200 text-green-700"
    },
    {
      zone: "2차 권역", 
      area: "대전 전 지역",
      time: "30분 내 출동",
      features: ["유성구, 서구, 동구, 대덕구", "둔산신도시, 도마동 전문", "기본 서비스 요금"],
      color: "bg-blue-50 border-blue-200 text-blue-700"
    },
    {
      zone: "3차 권역",
      area: "충청권 광역",
      time: "예약제 서비스",
      features: ["세종시, 청주, 천안, 공주, 논산", "사전 예약 필수", "출장비 50% 할인"],
      color: "bg-teal-50 border-teal-200 text-teal-700"
    }
  ]

  const landmarks = [
    { name: "대전역", distance: "5분", icon: "🚆" },
    { name: "충남대학교", distance: "15분", icon: "🎓" },
    { name: "KAIST", distance: "20분", icon: "🔬" },
    { name: "둔산신도시", distance: "10분", icon: "🏙️" },
    { name: "유성온천", distance: "25분", icon: "♨️" },
    { name: "세종시청", distance: "30분", icon: "🏛️" }
  ]

  return (
    <section id="location" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6 leading-tight">
            🗺️ 서비스 지역 안내
          </h2>
          <p className="text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            대전 중구 본사를 중심으로 충청권 전 지역에 빠르고 전문적인 서비스를 제공합니다
          </p>
        </div>

        {/* Headquarters Info */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-white p-8 mb-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">📍 Mission Clean 본사</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-blue-200 mr-3">📍</span>
                  <span className="text-lg">대전광역시 중구 동서대로 1435</span>
                </div>
                <div className="flex items-center">
                  <span className="text-blue-200 mr-3">🚇</span>
                  <span>대전역 인근, 접근성 우수</span>
                </div>
                <div className="flex items-center">
                  <span className="text-blue-200 mr-3">⚡</span>
                  <span>대전 전 지역 30분 내 출동 보장</span>
                </div>
              </div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-6">
              <h4 className="text-lg font-semibold mb-4">⏰ 운영시간</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>평일:</span>
                  <span className="font-semibold">오전 9시 - 오후 6시</span>
                </div>
                <div className="flex justify-between">
                  <span>주말:</span>
                  <span className="font-semibold">상담 및 응급 출동</span>
                </div>
                <div className="flex justify-between">
                  <span>공휴일:</span>
                  <span className="font-semibold">사전 예약시 서비스</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Areas */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {serviceAreas.map((area, index) => (
            <div key={index} className={`border-2 rounded-xl p-6 ${area.color}`}>
              <div className="text-center mb-4">
                <div className="inline-block bg-white rounded-full px-3 py-1 text-sm font-semibold mb-2">
                  {area.zone}
                </div>
                <h3 className="text-xl font-bold">{area.area}</h3>
                <p className="text-lg font-semibold mt-2">{area.time}</p>
              </div>
              <ul className="space-y-2">
                {area.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <span className="mr-2">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Landmarks Distance */}
        <div className="bg-gray-50 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            🚗 주요 지역별 도착 시간
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {landmarks.map((landmark, index) => (
              <div key={index} className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">{landmark.icon}</div>
                <h4 className="font-semibold text-gray-900">{landmark.name}</h4>
                <p className="text-blue-600 font-bold">{landmark.distance}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Special Daejeon Features */}
        <div className="mt-12 bg-blue-50 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-center text-blue-900 mb-6">
            🏘️ 대전 특화 서비스
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">🏢</div>
              <h4 className="font-bold text-gray-900 mb-2">아파트 단지별 맞춤</h4>
              <p className="text-gray-600 text-sm">둔산신도시, 도마동 아파트 서비스 경험 풍부</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">🎓</div>
              <h4 className="font-bold text-gray-900 mb-2">원룸 전문 청소</h4>
              <p className="text-gray-600 text-sm">충남대, KAIST 인근 원룸 맞춤 서비스</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">🏗️</div>
              <h4 className="font-bold text-gray-900 mb-2">고층 아파트 노하우</h4>
              <p className="text-gray-600 text-sm">둔산동 고층 아파트 전문 서비스</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">지금 바로 상담받으세요!</h3>
            <p className="text-lg mb-6">대전 중구 주민 10% 추가 할인 혜택</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:010-9171-8465"
                className="bg-white text-slate-700 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
              >
                📞 010-9171-8465
              </a>
              <button 
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-colors"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                온라인 예약하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LocationSection
