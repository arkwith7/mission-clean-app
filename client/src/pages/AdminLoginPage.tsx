import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const AdminLoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [rememberEmail, setRememberEmail] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // 컴포넌트 마운트시 저장된 이메일 불러오기
  useEffect(() => {
    const savedEmail = localStorage.getItem('adminEmail')
    if (savedEmail) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail
      }))
    }
  }, [])

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
    
    try {
      // AuthContext의 login 함수 사용
      await login(formData.email, formData.password)
      
      // 이메일 기억하기가 체크되어 있으면 localStorage에 저장
      if (rememberEmail) {
        localStorage.setItem('adminEmail', formData.email)
      } else {
        localStorage.removeItem('adminEmail')
      }

      // 관리자 대시보드로 이동
      navigate('/admin/dashboard')
    } catch (error: any) {
      console.error('로그인 오류:', error)
      setError(error.message || '로그인 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            🔐 관리자 로그인
          </h1>
          <p className="text-slate-600">
            예약 관리 시스템에 접속합니다
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="admin@aircleankorea.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center">
              <input
                id="rememberEmail"
                type="checkbox"
                checked={rememberEmail}
                onChange={(e) => setRememberEmail(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberEmail" className="ml-2 block text-sm text-gray-700">
                이메일 기억하기
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 disabled:bg-gray-400 text-white font-bold py-4 rounded-lg transition-colors text-lg"
            >
              {isLoading ? '로그인 중...' : '🔑 로그인'}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Help */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              로그인에 문제가 있으시면 기술 지원팀에 문의하세요
            </p>
            <a 
              href="tel:010-9171-8465"
              className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
            >
              📞 010-9171-8465
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginPage 