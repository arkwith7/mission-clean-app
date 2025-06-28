import { useState, useEffect } from 'react'
import { bookingAPI, type BookingData } from '../services/api'
import { useBooking } from '../contexts/BookingContext'

const ContactSection = () => {
  const { selectedService } = useBooking()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    serviceType: '',
    message: '',
    preferredDate: '',
    preferredTime: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // 선택된 서비스가 있을 때 폼 데이터 업데이트
  useEffect(() => {
    if (selectedService) {
      setFormData(prev => ({
        ...prev,
        serviceType: selectedService.serviceType
      }))
    }
  }, [selectedService])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const bookingData: BookingData = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        serviceType: formData.serviceType,
        preferredDate: formData.preferredDate || undefined,
        preferredTime: formData.preferredTime || undefined,
        message: formData.message || undefined,
      }

      const response = await bookingAPI.createBooking(bookingData)
      
      alert(`예약 신청이 완료되었습니다! 
예약번호: ${response.bookingId}
곧 연락드리겠습니다.`)
      
      // 폼 초기화
      setFormData({
        name: '',
        phone: '',
        address: '',
        serviceType: '',
        message: '',
        preferredDate: '',
        preferredTime: ''
      })
    } catch (error) {
      // 프로덕션에서는 에러 로깅을 최소화
      if (import.meta.env.DEV) {
        console.error('Booking error:', error)
      }
      alert('신청 중 오류가 발생했습니다. 전화로 연락 부탁드립니다: 010-9171-8465')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-slate-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6 leading-tight">
            📞 연락처 및 예약
          </h2>
          <p className="text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            24시간 상담 가능! 전화 또는 온라인으로 간편하게 예약하세요
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            {/* Phone Contact */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                📞 전화 상담 (추천)
              </h3>
              
              <div className="text-center mb-6">
                <a 
                  href="tel:010-9171-8465"
                  className="inline-block bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white text-2xl font-bold py-6 px-12 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                >
                  📞 010-9171-8465
                </a>
                <p className="text-green-600 font-semibold mt-4">24시간 상담 가능</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <span className="font-semibold">평일 (월~금)</span>
                  <span>오전 9시 - 오후 6시</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <span className="font-semibold">주말 (토~일)</span>
                  <span>상담 및 응급 출동</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <span className="font-semibold">공휴일</span>
                  <span>사전 예약시 서비스</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h4 className="font-bold text-green-800 mb-2">✅ 전화 상담의 장점</h4>
                <ul className="text-green-700 space-y-1 text-sm">
                  <li>• 즉시 상담 및 예약 확정</li>
                  <li>• 맞춤형 서비스 안내</li>
                  <li>• 특가 혜택 실시간 확인</li>
                  <li>• 궁금한 점 바로 해결</li>
                </ul>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">📍 본사 위치</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">주소</h4>
                  <p className="text-lg">대전광역시 중구 동서대로 1435</p>
                  <p className="text-gray-600">대전역 인근, 접근성 우수</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">이메일</h4>
                  <p className="text-lg text-blue-600">info@aircleankorea.com</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">웹사이트</h4>
                  <p className="text-lg text-blue-600">www.aircleankorea.com</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-bold text-blue-800 mb-2">🏢 지역 인증</h4>
                <ul className="text-blue-700 space-y-1 text-sm">
                  <li>• 대전시 소상공인 지원사업 참여</li>
                  <li>• 중구청 협력 업체</li>
                  <li>• 대전상공회의소 회원사</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Online Booking Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              📝 온라인 예약 신청
            </h3>
            
            {/* 선택된 서비스 표시 */}
            {selectedService && (
              <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 mb-6">
                <h4 className="font-bold text-cyan-800 mb-2">선택하신 서비스</h4>
                <div className="flex justify-between items-center">
                  <span className="text-cyan-700 font-semibold">{selectedService.serviceName}</span>
                  <span className="text-cyan-600 font-bold">{selectedService.price}</span>
                </div>
                <p className="text-cyan-600 text-sm mt-2">{selectedService.description}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    이름 *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="홍길동"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    연락처 *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="010-1234-5678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  서비스 주소 *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="대전시 중구 ○○동 ○○아파트 ○○○호"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  서비스 종류 *
                </label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">서비스를 선택해주세요</option>
                  <option value="벽걸이형">벽걸이형 에어컨 청소 (80,000원)</option>
                  <option value="스탠드형">스탠드형 에어컨 청소 (130,000원)</option>
                  <option value="시스템1way">시스템 에어컨 1way 청소 (120,000원)</option>
                  <option value="시스템4way">시스템 에어컨 천정형 4way 청소 (150,000원)</option>
                  <option value="실외기">실외기 청소 (60,000원)</option>
                  <option value="2대이상">2대 이상 (상담 후 결정)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    희망 날짜
                  </label>
                  <input
                    type="date"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    희망 시간
                  </label>
                  <select
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">시간 선택</option>
                    <option value="morning">오전 (9시-12시)</option>
                    <option value="afternoon">오후 (1시-5시)</option>
                    <option value="evening">저녁 (5시-7시)</option>
                    <option value="consultation">상담 후 결정</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  추가 요청사항
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="에어컨 종류, 특별한 요청사항 등을 알려주세요"
                />
              </div>

              <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                <h4 className="font-bold text-teal-800 mb-2">🎯 7월 특가 혜택</h4>
                <ul className="text-teal-700 space-y-1 text-sm">
                  <li>• 모든 서비스 20% 할인</li>
                  <li>• 대전 중구 주민 추가 10% 할인</li>
                  <li>• 무료 항균 코팅 서비스</li>
                  <li>• 1년 품질보증</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-lg transition-colors text-lg"
              >
                {isSubmitting ? '신청 중...' : '🎯 지금 20% 할인 예약하기'}
              </button>

              <p className="text-center text-sm text-gray-600">
                예약 신청 후 1시간 내에 연락드립니다
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection
