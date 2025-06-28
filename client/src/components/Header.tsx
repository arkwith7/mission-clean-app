import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './AuthModal'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // 섹션으로 스크롤하는 함수
  const scrollToSection = (sectionId: string) => {
    // 현재 홈페이지가 아닌 경우 홈페이지로 이동 후 스크롤
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        const element = document.getElementById(sectionId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    } else {
      // 이미 홈페이지인 경우 바로 스크롤
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
    setIsMenuOpen(false) // 모바일 메뉴 닫기
  }

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50 border-b border-cyan-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="text-2xl font-bold text-cyan-600">
              🧹 Mission Clean
            </div>
            <span className="ml-3 text-sm text-slate-600 font-medium">대전 전문 에어컨 청소</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => scrollToSection('services')}
              className="text-slate-700 hover:text-cyan-600 transition-colors font-medium"
            >
              서비스 소개
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-slate-700 hover:text-cyan-600 transition-colors font-medium"
            >
              예약하기
            </button>
            <button
              onClick={() => {
                navigate('/booking-check')
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }, 100)
              }}
              className="text-slate-700 hover:text-cyan-600 transition-colors font-medium"
            >
              📋 예약확인
            </button>
            
            {/* Auth Buttons or User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold">
                    {user?.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-slate-700 font-medium">{user?.username}</span>
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm text-gray-500">로그인됨</p>
                      <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                    </div>
                    {user?.role === 'admin' && (
                      <Link to="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        📊 관리자 패널
                      </Link>
                    )}
                    {!user?.role && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        🔐 관리자 로그인
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout()
                        setShowUserMenu(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('register')
                  setIsAuthModalOpen(true)
                }}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
              >
                회원가입
              </button>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 rounded-lg">
              <button
                onClick={() => scrollToSection('services')}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600"
              >
                서비스 소개
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600"
              >
                예약하기
              </button>
              <button
                onClick={() => {
                  navigate('/booking-check')
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }, 100)
                  setIsMenuOpen(false)
                }}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600"
              >
                📋 예약확인
              </button>
              
              {/* Mobile Auth */}
              {isAuthenticated ? (
                <div className="border-t border-gray-200 pt-2">
                  <div className="px-3 py-2">
                    <p className="text-sm text-gray-500">로그인됨</p>
                    <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                  </div>
                  <button
                    onClick={() => {
                      logout()
                      setIsMenuOpen(false)
                    }}
                    className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-2">
                  <button
                    onClick={() => {
                      setAuthMode('register')
                      setIsAuthModalOpen(true)
                      setIsMenuOpen(false)
                    }}
                    className="block w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-2 rounded-lg font-medium text-center"
                  >
                    회원가입
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authMode}
        />
      </div>
    </header>
  )
}

export default Header
