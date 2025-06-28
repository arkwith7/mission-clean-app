import { useState, useEffect } from 'react'
import { dashboardAPI } from '../../services/api'

interface Stats {
  bookings: {
    total: number
    pending: number
    confirmed: number
    completed: number
    cancelled: number
  }
  users: {
    total: number
    admin: number
    manager: number
    customer: number
    active: number
  }
  customers: {
    total: number
    individual: number
    corporate: number
    marketingConsent: number
    smsConsent: number
  }
}

const DashboardStats = () => {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await dashboardAPI.getStats()
        setStats(response.data)
      } catch (error: unknown) {
        console.error('통계 데이터 조회 중 오류:', error)
        setError('통계 데이터를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">통계 데이터 로딩 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">통계 데이터가 없습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <span className="text-3xl mr-3">📊</span>
          대시보드
        </h1>
        <p className="text-gray-600 mt-1">전체 현황을 한눈에 확인할 수 있습니다.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 예약 통계 */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">📋 예약 현황</h3>
            <span className="text-2xl">📊</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-3xl font-bold text-blue-600">{stats.bookings.total}</span>
              <span className="text-sm text-gray-500">전체 예약</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-yellow-600">📅 대기중</span>
                <span className="font-medium">{stats.bookings.pending}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">✅ 확정</span>
                <span className="font-medium">{stats.bookings.confirmed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600">🏁 완료</span>
                <span className="font-medium">{stats.bookings.completed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">❌ 취소</span>
                <span className="font-medium">{stats.bookings.cancelled}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 회원 통계 */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">👤 회원 현황</h3>
            <span className="text-2xl">👥</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-3xl font-bold text-green-600">{stats.users.total}</span>
              <span className="text-sm text-gray-500">전체 회원</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-red-600">👑 관리자</span>
                <span className="font-medium">{stats.users.admin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600">🎯 매니저</span>
                <span className="font-medium">{stats.users.manager}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">👤 고객</span>
                <span className="font-medium">{stats.users.customer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">✅ 활성</span>
                <span className="font-medium">{stats.users.active}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 고객 통계 */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">🏢 고객 현황</h3>
            <span className="text-2xl">📈</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-3xl font-bold text-purple-600">{stats.customers.total}</span>
              <span className="text-sm text-gray-500">전체 고객</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-600">👤 개인</span>
                <span className="font-medium">{stats.customers.individual}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">🏢 기업</span>
                <span className="font-medium">{stats.customers.corporate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-600">📧 마케팅 동의</span>
                <span className="font-medium">{stats.customers.marketingConsent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pink-600">📱 SMS 동의</span>
                <span className="font-medium">{stats.customers.smsConsent}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 빠른 실행</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-2">📋</div>
            <div className="text-sm font-medium">새 예약 등록</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-2">👤</div>
            <div className="text-sm font-medium">회원 추가</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-2">🏢</div>
            <div className="text-sm font-medium">고객 등록</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm font-medium">보고서 생성</div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 최근 활동</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <span className="text-blue-600">📋</span>
            <div className="flex-1">
              <p className="text-sm font-medium">실시간 데이터가 업데이트되었습니다.</p>
              <p className="text-xs text-gray-500">방금 전</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <span className="text-green-600">📊</span>
            <div className="flex-1">
              <p className="text-sm font-medium">통계 데이터가 새로고침되었습니다.</p>
              <p className="text-xs text-gray-500">1분 전</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <span className="text-purple-600">🔄</span>
            <div className="flex-1">
              <p className="text-sm font-medium">대시보드가 실시간 데이터로 전환되었습니다.</p>
              <p className="text-xs text-gray-500">방금 전</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardStats 