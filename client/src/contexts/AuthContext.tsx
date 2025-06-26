import React, { createContext, useContext, useEffect, useState } from 'react'
import { authAPI, type User } from '../services/api'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  error: string | null
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isAuthenticated = !!user

  // 초기 로딩 시 토큰이 있으면 사용자 정보 가져오기
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken')
      if (token) {
        try {
          const response = await authAPI.getProfile()
          setUser(response.data.user)
        } catch (error) {
          if (import.meta.env.DEV) {
          console.error('Failed to get user profile:', error)
        }
          localStorage.removeItem('authToken')
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      setIsLoading(true)
      
      const response = await authAPI.login({ email, password })
      
      if (response.success) {
        localStorage.setItem('authToken', response.data.token)
        setUser(response.data.user)
      } else {
        throw new Error('로그인에 실패했습니다.')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || '로그인 중 오류가 발생했습니다.'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      setError(null)
      setIsLoading(true)
      
      const response = await authAPI.register({ username, email, password })
      
      if (response.success) {
        localStorage.setItem('authToken', response.data.token)
        setUser(response.data.user)
      } else {
        throw new Error('회원가입에 실패했습니다.')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || '회원가입 중 오류가 발생했습니다.'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    setUser(null)
    setError(null)
  }

  const clearError = () => {
    setError(null)
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    error,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 