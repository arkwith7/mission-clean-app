const ServicesSection = () => {
  const services = [
    {
      title: "일반형 에어컨 청소",
      price: "80,000원",
      originalPrice: "100,000원", 
      features: [
        "실내기 완전 분해 청소",
        "필터 교체 및 청소",
        "드레인 청소",
        "기본 점검 서비스"
      ],
      icon: "🏠"
    },
    {
      title: "시스템 에어컨 청소", 
      price: "120,000원",
      originalPrice: "150,000원",
      features: [
        "시스템 에어컨 전용 청소",
        "덕트 청소 포함",
        "항균 코팅 서비스",
        "정밀 점검 및 AS"
      ],
      icon: "🏢"
    },
    {
      title: "실외기 청소",
      price: "60,000원", 
      originalPrice: "75,000원",
      features: [
        "실외기 고압 세척",
        "방열판 청소",
        "배수관 청소",
        "냉매 압력 점검"
      ],
      icon: "🌪️"
    }
  ]

  const daejeonServices = [
    {
      area: "대전 중구",
      time: "20분 내 도착",
      discount: "10% 추가 할인",
      description: "동서대로 본사에서 직접 출동"
    },
    {
      area: "대전 전 지역",
      time: "30분 내 도착", 
      discount: "기본 요금",
      description: "유성구, 서구, 동구, 대덕구"
    },
    {
      area: "충청권",
      time: "예약제",
      discount: "출장비 50% 할인",
      description: "세종시, 청주, 천안, 공주, 논산"
    }
  ]

  return (
    <section id="services" className="py-20 bg-gradient-to-br from-cyan-50 via-blue-50 to-sky-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20 pt-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6 leading-tight">
            전문 에어컨 청소 서비스
          </h2>
          <p className="text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            3년 경력의 전문가가 직접 방문하여 에어컨을 새것처럼 깨끗하게 만들어드립니다
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-cyan-100 hover:border-cyan-200 hover:-translate-y-2">
              <div className="text-center">
                <div className="text-5xl mb-6 filter drop-shadow-sm">{service.icon}</div>
                <h3 className="text-xl font-bold text-slate-800 mb-6 leading-tight">{service.title}</h3>
                
                <div className="mb-8">
                  <div className="text-slate-400 line-through text-lg mb-1">{service.originalPrice}</div>
                  <div className="text-3xl font-bold text-cyan-600 mb-2">{service.price}</div>
                  <div className="text-teal-600 font-semibold bg-teal-50 px-3 py-1 rounded-full inline-block border border-teal-200">20% 할인가</div>
                </div>

                <ul className="text-left space-y-3 mb-8">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-slate-600">
                      <span className="text-emerald-500 mr-3 text-lg">✓</span>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  예약하기
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Daejeon Specialized Services */}
        <div className="bg-white rounded-2xl shadow-xl p-10 border border-cyan-100">
          <h3 className="text-3xl font-bold text-center text-slate-800 mb-10">
            🏘️ 대전 지역 특화 서비스
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {daejeonServices.map((service, index) => (
              <div key={index} className="border-2 border-cyan-100 rounded-xl p-6 hover:border-cyan-300 hover:bg-cyan-50 transition-all duration-300 hover:shadow-lg">
                <h4 className="text-lg font-bold text-cyan-700 mb-4">{service.area}</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">도착 시간:</span>
                    <span className="font-semibold text-slate-800">{service.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">특별 혜택:</span>
                    <span className="font-semibold text-teal-700 bg-teal-50 px-2 py-1 rounded-full text-xs border border-teal-200">{service.discount}</span>
                  </div>
                  <p className="text-slate-600 mt-4 leading-relaxed">{service.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-8 border border-cyan-200">
              <h4 className="text-2xl font-bold text-slate-800 mb-6">
                🎯 대전 시민들이 선택한 믿을 수 있는 청소 서비스
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mt-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-cyan-600">20곳+</div>
                  <div className="text-sm text-slate-600">협력 관리사무소</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-cyan-600">500회+</div>
                  <div className="text-sm text-slate-600">누적 서비스</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-cyan-600">98%</div>
                  <div className="text-sm text-slate-600">고객 만족도</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-cyan-600">85%</div>
                  <div className="text-sm text-slate-600">재이용률</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ServicesSection
