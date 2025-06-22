import { useState } from 'react'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#services" className="text-slate-700 hover:text-cyan-600 transition-colors font-medium">
              서비스 소개
            </a>
            <a href="#location" className="text-slate-700 hover:text-cyan-600 transition-colors font-medium">
              서비스 지역
            </a>
            <a href="#contact" className="text-slate-700 hover:text-cyan-600 transition-colors font-medium">
              연락처
            </a>
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
              <a 
                href="tel:010-9171-8465" 
                className="block bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-3 py-2 rounded-lg font-semibold text-center"
              >
                📞 010-9171-8465
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
