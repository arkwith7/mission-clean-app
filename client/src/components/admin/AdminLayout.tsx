import { useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface AdminLayoutProps {
  children: ReactNode
  currentPage: string
}

type MenuItem = {
  id: string
  name: string
  icon: string
  path: string
}

const AdminLayout = ({ children, currentPage }: AdminLayoutProps) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const menuItems: MenuItem[] = [
    { id: 'dashboard', name: '대시보드', icon: '📊', path: '/admin/dashboard' },
    { id: 'bookings', name: '예약 관리', icon: '📋', path: '/admin/bookings' },
    { id: 'users', name: '회원 관리', icon: '👤', path: '/admin/users' },
    { id: 'customers', name: '고객 관리', icon: '🏢', path: '/admin/customers' },
  ]

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/admin')
    } catch (error) {
      console.error('로그아웃 오류:', error)
    }
  }

  const handleMenuClick = (path: string) => {
    navigate(path)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top Header - 전체 폭 */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Logo/Brand - 홈 링크 */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors group"
            >
              <div className="text-2xl group-hover:scale-110 transition-transform">🔧</div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">Mission Clean</h1>
              </div>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* 사용자 프로필 */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                  <p className="text-xs text-gray-500">{user?.role === 'admin' ? '관리자' : '매니저'}</p>
                </div>
                <span className="text-gray-400">⚙️</span>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                    <p className="text-xs text-gray-500">현재 시간: {new Date().toLocaleString('ko-KR')}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    🚪 로그아웃
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Bottom Split - 사이드바 + 워크스페이스 */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg border-r border-gray-200">
          {/* Navigation Menu */}
          <nav className="p-3">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.path)}
                className={`w-full flex items-center px-3 py-3 text-left rounded-lg mb-2 transition-colors ${
                  currentPage === item.id
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-lg mr-3">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Workspace */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout 