import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './AuthModal'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50 border-b border-cyan-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-2xl font-bold text-cyan-600">
              🧹 Mission Clean
            </div>
            <span className="ml-3 text-sm text-slate-600 font-medium">대전 전문 에어컨 청소</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#services" className="text-slate-700 hover:text-cyan-600 transition-colors font-medium">
              서비스 소개
            </a>
            <a href="#location" className="text-slate-700 hover:text-cyan-600 transition-colors font-medium">
              서비스 지역
            </a>
            <a href="#contact" className="text-slate-700 hover:text-cyan-600 transition-colors font-medium">
              연락처
            </a>
            
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
                      <a href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        관리자 패널
                      </a>
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
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setAuthMode('login')
                    setIsAuthModalOpen(true)
                  }}
                  className="text-slate-700 hover:text-cyan-600 font-medium transition-colors"
                >
                  로그인
                </button>
                <button
                  onClick={() => {
                    setAuthMode('register')
                    setIsAuthModalOpen(true)
                  }}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
                >
                  회원가입
                </button>
              </div>
            )}
            
            <a 
              href="tel:010-9171-8465" 
              className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105 shadow-lg"
            >
              📞 010-9171-8465
            </a>
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
              <a href="#services" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                서비스 소개
              </a>
              <a href="#location" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                서비스 지역
              </a>
              <a href="#contact" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                연락처
              </a>
              
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
                <div className="border-t border-gray-200 pt-2 space-y-1">
                  <button
                    onClick={() => {
                      setAuthMode('login')
                      setIsAuthModalOpen(true)
                      setIsMenuOpen(false)
                    }}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600"
                  >
                    로그인
                  </button>
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
              
              <a 
                href="tel:010-9171-8465" 
                className="block bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-3 py-2 rounded-lg font-semibold text-center"
              >
                📞 010-9171-8465
              </a>
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
