import axios from 'axios'
import type { 
  UserResponse, SingleUserResponse, CreateUserData, UpdateUserData,
  CustomerResponse, SingleCustomerResponse, CreateCustomerData, UpdateCustomerData
} from '../types/admin'

const API_BASE_URL = import.meta.env.MODE === 'production'
  ? '/api' 
  : 'http://localhost:3001/api'

console.log('🔧 API_BASE_URL:', API_BASE_URL)
console.log('🔧 import.meta.env.MODE:', import.meta.env.MODE)

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// 토큰을 API 요청에 자동으로 추가하는 인터셉터
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  console.log('🚀 API Request:', {
    method: config.method,
    url: config.url,
    baseURL: config.baseURL,
    fullURL: `${config.baseURL}${config.url}`,
    data: config.data
  })
  return config
})

// 응답 인터셉터 추가
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    })
    return response
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    })
    return Promise.reject(error)
  }
)

export interface BookingData {
  name: string
  phone: string
  address: string
  serviceType: string
  preferredDate?: string
  preferredTime?: string
  message?: string
  privacyConsent?: boolean
}

export interface BookingResponse {
  message: string
  bookingId: number
  data: BookingData
}

// 기존 User 인터페이스 유지 (auth용)
export interface AuthUser {
  id: number
  username: string
  email: string
  role: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    token: string
    user: AuthUser
  }
}

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
}

export interface Booking {
  id: number
  booking_id: number
  service_date: string
  service_time: string
  service_type: string
  status: string
  created_at: string
  customer_name: string
  customer_phone: string
  customer_address: string
  special_requests: string | null
}

export const authAPI = {
  // 회원가입
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  // 로그인
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data)
    return response.data
  },

  // 프로필 조회
  getProfile: async (): Promise<{ success: boolean; data: { user: AuthUser } }> => {
    const response = await api.get('/auth/profile')
    return response.data
  },

  // 로그아웃
  logout: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/auth/logout')
    return response.data
  },
}

export interface BookingCheckData {
  phone: string
}

export interface BookingCheckResponse {
  success: boolean
  data: {
    booking_id: number
    customer_name: string
    customer_phone: string
    customer_address: string
    service_type: string
    service_date: string | null
    service_time: string | null
    special_requests: string | null
    status: string
    created_at: string
  }
}

export const bookingAPI = {
  // Create a new booking
  createBooking: async (data: BookingData): Promise<BookingResponse> => {
    const response = await api.post('/bookings', data)
    return response.data
  },

  // Check booking (public)
  checkBooking: async (data: BookingCheckData): Promise<BookingCheckResponse> => {
    const response = await api.post('/bookings/check', data)
    return response.data
  },

  // Get all bookings (admin only)
  getAllBookings: async (): Promise<{ success: boolean; data: Booking[] }> => {
    const response = await api.get('/bookings')
    return response.data
  },

  // Get specific booking (admin only)
  getBooking: async (id: number): Promise<{ booking: Booking }> => {
    const response = await api.get(`/bookings/${id}`)
    return response.data
  },

  // Update booking status (admin only)
  updateBookingStatus: async (id: number, status: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.put(`/bookings/${id}/status`, { status })
    return response.data
  },
}

// User 관리 API
export const userAPI = {
  // 모든 사용자 목록 조회
  getUsers: async (params?: {
    page?: number
    limit?: number
    search?: string
    role?: string
    status?: string
  }): Promise<UserResponse> => {
    const response = await api.get('/users', { params })
    return response.data
  },

  // 특정 사용자 조회
  getUser: async (id: number): Promise<SingleUserResponse> => {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  // 새 사용자 생성
  createUser: async (data: CreateUserData): Promise<SingleUserResponse> => {
    const response = await api.post('/users', data)
    return response.data
  },

  // 사용자 정보 수정
  updateUser: async (id: number, data: UpdateUserData): Promise<SingleUserResponse> => {
    const response = await api.put(`/users/${id}`, data)
    return response.data
  },

  // 사용자 삭제
  deleteUser: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/users/${id}`)
    return response.data
  },

  // 사용자 상태 변경
  updateUserStatus: async (id: number, status: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.patch(`/users/${id}/status`, { status })
    return response.data
  },
}

// Customer 관리 API
export const customerAPI = {
  // 모든 고객 목록 조회
  getCustomers: async (params?: {
    page?: number
    limit?: number
    search?: string
    customer_type?: string
    age_group?: string
    registration_source?: string
  }): Promise<CustomerResponse> => {
    const response = await api.get('/customers', { params })
    return response.data
  },

  // 특정 고객 조회
  getCustomer: async (id: number): Promise<SingleCustomerResponse> => {
    const response = await api.get(`/customers/${id}`)
    return response.data
  },

  // 새 고객 생성
  createCustomer: async (data: CreateCustomerData): Promise<SingleCustomerResponse> => {
    const response = await api.post('/customers', data)
    return response.data
  },

  // 고객 정보 수정
  updateCustomer: async (id: number, data: UpdateCustomerData): Promise<SingleCustomerResponse> => {
    const response = await api.put(`/customers/${id}`, data)
    return response.data
  },

  // 고객 삭제
  deleteCustomer: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/customers/${id}`)
    return response.data
  },
}

// Dashboard Stats Interface
export interface DashboardStats {
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

export interface DashboardStatsResponse {
  success: boolean
  data: DashboardStats
}

// Dashboard API
export const dashboardAPI = {
  // 대시보드 통계 조회 (통합 API 호출)
  getStats: async (): Promise<DashboardStatsResponse> => {
    try {
      const response = await api.get('/dashboard/stats')
      
      // API 응답 데이터 구조에 맞게 반환
      return {
        success: response.data.success,
        data: response.data.data
      }
    } catch (error) {
      console.error('대시보드 통계 조회 중 오류:', error)
      throw error // 오류를 다시 throw하여 호출 측에서 처리할 수 있도록 함
    }
  },
}

export const captchaAPI = {
  // CAPTCHA 생성
  generateCaptcha: async (type: 'math' | 'korean' = 'math') => {
    const response = await api.get(`/captcha/generate?type=${type}`)
    return response.data
  },
  // CAPTCHA 검증
  verifyCaptcha: async (id: string, answer: string) => {
    const response = await api.post('/captcha/verify', { id, answer })
    return response.data
  },
}

export default api
