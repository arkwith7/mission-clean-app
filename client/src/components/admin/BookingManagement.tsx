import { useState, useEffect, useMemo } from 'react'
import { bookingAPI, type Booking } from '../../services/api'

const BookingManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  
  // 임시 검색 및 필터 상태 (조회 버튼 클릭 전)
  const [tempSearchTerm, setTempSearchTerm] = useState('')
  const [tempStatusFilter, setTempStatusFilter] = useState<string>('all')
  const [tempDateFrom, setTempDateFrom] = useState(() => {
    const date = new Date()
    date.setMonth(date.getMonth() - 1)
    return date.toISOString().split('T')[0]
  })
  const [tempDateTo, setTempDateTo] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  
  // 실제 적용된 검색 및 필터 상태
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date()
    date.setMonth(date.getMonth() - 1)
    return date.toISOString().split('T')[0]
  })
  const [dateTo, setDateTo] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setIsLoading(true)
      const response = await bookingAPI.getAllBookings()
      console.log('📊 [BookingManagement] API 응답:', response)
      setBookings(response.data || [])
    } catch (error: any) {
      console.error('예약 목록 조회 오류:', error)
      setError('예약 목록을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '대기중'
      case 'confirmed': return '확정'
      case 'completed': return '완료'
      case 'cancelled': return '취소'
      default: return status
    }
  }

  const formatTimeDescription = (timeCode: string | null) => {
    const timeMap: { [key: string]: string } = {
      'morning': '오전 (9시-12시)',
      'afternoon': '오후 (1시-5시)', 
      'evening': '저녁 (5시-7시)',
      'consultation': '상담 후 결정'
    }
    
    return timeCode ? timeMap[timeCode] || timeCode : '-'
  }

  // 필터링된 예약 목록
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      // 텍스트 검색 (이름, 전화번호, 주소, 서비스 타입)
      const matchesSearch = searchTerm === '' || 
        booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customer_phone.includes(searchTerm) ||
        booking.customer_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.service_type.toLowerCase().includes(searchTerm.toLowerCase())
      
      // 상태 필터
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
      
      // 날짜 필터 (생성일 기준)
      const bookingDate = new Date(booking.created_at).toISOString().split('T')[0]
      const matchesDate = bookingDate >= dateFrom && bookingDate <= dateTo
      
      return matchesSearch && matchesStatus && matchesDate
    })
  }, [bookings, searchTerm, statusFilter, dateFrom, dateTo])

  // 페이지네이션된 예약 목록
  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredBookings.slice(startIndex, endIndex)
  }, [filteredBookings, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)

  const updateBookingStatus = async (bookingId: number, newStatus: string) => {
    try {
      setError('')
      setSuccessMessage('')
      await bookingAPI.updateBookingStatus(bookingId, newStatus)
      
      // 성공 메시지 표시
      const message = `예약 #${bookingId}의 상태가 "${getStatusText(newStatus)}"로 변경되었습니다.`
      setSuccessMessage(message)
      
      // 3초 후 성공 메시지 자동 숨김
      setTimeout(() => setSuccessMessage(''), 3000)
      
      // 예약 목록 새로고침
      await fetchBookings()
    } catch (error: any) {
      console.error('상태 변경 오류:', error)
      setError('상태 변경 중 오류가 발생했습니다.')
    }
  }

  // 조회 버튼 클릭 핸들러
  const handleSearch = () => {
    setSearchTerm(tempSearchTerm)
    setStatusFilter(tempStatusFilter)
    setDateFrom(tempDateFrom)
    setDateTo(tempDateTo)
    setCurrentPage(1)
  }

  // 필터 초기화
  const resetFilters = () => {
    const date = new Date()
    date.setMonth(date.getMonth() - 1)
    const defaultDateFrom = date.toISOString().split('T')[0]
    const defaultDateTo = new Date().toISOString().split('T')[0]
    
    // 임시 상태 초기화
    setTempSearchTerm('')
    setTempStatusFilter('all')
    setTempDateFrom(defaultDateFrom)
    setTempDateTo(defaultDateTo)
    
    // 실제 필터 즉시 적용
    setSearchTerm('')
    setStatusFilter('all')
    setDateFrom(defaultDateFrom)
    setDateTo(defaultDateTo)
    setCurrentPage(1)
  }

  // 엔터키로 검색
  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">예약 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <span className="text-3xl mr-3">📋</span>
          예약 관리
        </h1>
        <p className="text-gray-600 mt-1">예약 현황을 조회하고 관리할 수 있습니다.</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">🔍 검색 및 필터</h3>
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              🔄 초기화
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 검색창 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">검색</label>
              <input
                type="text"
                placeholder="이름, 전화번호, 주소, 서비스"
                value={tempSearchTerm}
                onChange={(e) => setTempSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 상태 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
              <select
                value={tempStatusFilter}
                onChange={(e) => setTempStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">전체</option>
                <option value="pending">대기중</option>
                <option value="confirmed">확정</option>
                <option value="completed">완료</option>
                <option value="cancelled">취소</option>
              </select>
            </div>

            {/* 신청 시작일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">신청 시작일</label>
              <input
                type="date"
                value={tempDateFrom}
                onChange={(e) => setTempDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 신청 종료일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">신청 종료일</label>
              <input
                type="date"
                value={tempDateTo}
                onChange={(e) => setTempDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 조회 버튼 */}
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                🔍 조회
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">📋 예약 목록</h2>
          <div className="text-sm text-gray-600 flex items-center space-x-4">
            <span>총 {bookings.length}개 중 {filteredBookings.length}개 표시</span>
            <button
              onClick={fetchBookings}
              className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-xs"
            >
              🔄 새로고침
            </button>
            {filteredBookings.length !== bookings.length && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                필터 적용됨
              </span>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        {successMessage && (
          <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">{successMessage}</p>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  예약번호
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  고객정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  서비스
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  희망일시
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  신청일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="text-4xl mb-2">📭</div>
                    <p>검색 조건에 맞는 예약이 없습니다.</p>
                    <p className="text-sm mt-1">필터를 조정하거나 검색어를 변경해보세요.</p>
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{booking.booking_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.customer_name}</div>
                        <div className="text-sm text-gray-500">{booking.customer_phone}</div>
                        <div className="text-sm text-gray-500">{booking.customer_address}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.service_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>{booking.service_date || '-'}</div>
                        <div className="text-gray-500">{formatTimeDescription(booking.service_time)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(booking.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      {booking.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => updateBookingStatus(booking.booking_id, 'confirmed')}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                          >
                            확정
                          </button>
                          <button 
                            onClick={() => updateBookingStatus(booking.booking_id, 'cancelled')}
                            className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                          >
                            취소
                          </button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <button 
                          onClick={() => updateBookingStatus(booking.booking_id, 'completed')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                        >
                          완료
                        </button>
                      )}
                      {(booking.status === 'completed' || booking.status === 'cancelled') && (
                        <span className="text-gray-500 text-xs">
                          {booking.status === 'completed' ? '✅ 서비스 완료' : '❌ 취소됨'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                페이지 {currentPage} / {totalPages} 
                <span className="ml-2">
                  ({((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredBookings.length)} / {filteredBookings.length}개)
                </span>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  ⏮️
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  ⬅️
                </button>
                
                {/* 페이지 번호들 */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 text-sm border rounded-md ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  ➡️
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  ⏭️
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookingManagement 