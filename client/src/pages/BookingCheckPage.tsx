import { useState } from 'react'
import { bookingAPI, type BookingCheckResponse } from '../services/api'

const BookingCheckPage = () => {
  const [formData, setFormData] = useState({
    phone: ''
  })
  const [bookingData, setBookingData] = useState<BookingCheckResponse['data'] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('') // 입력시 에러 초기화
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setBookingData(null)
    
    try {
      const response = await bookingAPI.checkBooking({
        phone: formData.phone
      })
      
      setBookingData(response.data)
    } catch (error: any) {
      console.error('예약 조회 오류:', error)
      if (error.response?.data?.error) {
        setError(error.response.data.error)
      } else {
        setError('예약 확인 중 오류가 발생했습니다. 다시 시도해주세요.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '접수 대기중'
      case 'confirmed': return '예약 확정'
      case 'completed': return '서비스 완료'
      case 'cancelled': return '취소됨'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatTimeDescription = (timeCode: string | null) => {
    const timeMap: { [key: string]: string } = {
      'morning': '오전 (9시-12시)',
      'afternoon': '오후 (1시-5시)', 
      'evening': '저녁 (5시-7시)',
      'consultation': '상담 후 결정'
    }
    
    return timeCode ? timeMap[timeCode] || timeCode : '미정'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            📋 예약 확인
          </h1>
          <p className="text-xl text-slate-600">
            전화번호로 가장 최신 예약 상태를 확인하세요
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                전화번호 *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="예: 010-1234-5678 또는 01012345678"
              />
              <p className="text-sm text-gray-500 mt-2">
                가장 최신 예약 정보를 조회합니다
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-lg transition-colors text-lg"
            >
              {isLoading ? '🔍 확인 중...' : '🔍 예약 확인하기'}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Booking Result */}
          {bookingData && (
            <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl">
              <h3 className="text-xl font-bold text-green-800 mb-6 flex items-center">
                ✅ 예약 정보
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="font-medium text-gray-700">예약번호</span>
                  <span className="font-bold text-lg text-blue-600">#{bookingData.booking_id}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="font-medium text-gray-700">예약 상태</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(bookingData.status)}`}>
                    {getStatusText(bookingData.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-lg">
                    <div className="font-medium text-gray-700 mb-1">고객명</div>
                    <div className="text-gray-900">{bookingData.customer_name}</div>
                  </div>
                  
                  <div className="p-3 bg-white rounded-lg">
                    <div className="font-medium text-gray-700 mb-1">연락처</div>
                    <div className="text-gray-900">{bookingData.customer_phone}</div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg">
                  <div className="font-medium text-gray-700 mb-1">서비스 주소</div>
                  <div className="text-gray-900">{bookingData.customer_address}</div>
                </div>

                <div className="p-3 bg-white rounded-lg">
                  <div className="font-medium text-gray-700 mb-1">서비스 종류</div>
                  <div className="text-gray-900 font-semibold">{bookingData.service_type}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-lg">
                    <div className="font-medium text-gray-700 mb-1">희망 날짜</div>
                    <div className="text-gray-900">{bookingData.service_date || '미정'}</div>
                  </div>
                  
                  <div className="p-3 bg-white rounded-lg">
                    <div className="font-medium text-gray-700 mb-1">희망 시간</div>
                    <div className="text-gray-900">{formatTimeDescription(bookingData.service_time)}</div>
                  </div>
                </div>

                {bookingData.special_requests && (
                  <div className="p-3 bg-white rounded-lg">
                    <div className="font-medium text-gray-700 mb-1">요청사항</div>
                    <div className="text-gray-900">{bookingData.special_requests}</div>
                  </div>
                )}

                <div className="p-3 bg-white rounded-lg">
                  <div className="font-medium text-gray-700 mb-1">신청일</div>
                  <div className="text-gray-900">{new Date(bookingData.created_at).toLocaleString('ko-KR')}</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-bold text-blue-800 mb-2">📞 문의가 있으시면</h4>
                <p className="text-blue-700 text-sm mb-2">
                  예약 변경이나 추가 문의사항이 있으시면 언제든지 연락주세요.
                </p>
                <button 
                  onClick={() => {
                    window.location.href = '/#contact';
                    window.location.reload();
                  }}
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  📞 예약문의
                </button>
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-bold text-blue-800 mb-2">📞 도움이 필요하신가요?</h4>
            <p className="text-blue-700 text-sm">
              예약번호를 잊으셨거나 문제가 있으시면 언제든지 연락주세요.
            </p>
            <button 
              onClick={() => {
                window.location.href = '/#contact';
                window.location.reload();
              }}
              className="inline-block mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              📞 예약문의
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingCheckPage 