import axios from 'axios'

const API_BASE_URL = import.meta.env.PROD 
  ? '/api' 
  : 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 토큰을 API 요청에 자동으로 추가하는 인터셉터
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface BookingData {
  name: string
  phone: string
  address: string
  serviceType: string
  preferredDate?: string
  preferredTime?: string
  message?: string
}

export interface BookingResponse {
  message: string
  bookingId: number
  data: BookingData
}

export interface User {
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
    user: User
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
  service_date: string
  service_time: string
  service_type: string
  status: string
  created_at: string
  customer_name: string
  customer_phone: string
  customer_address: string
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
  getProfile: async (): Promise<{ success: boolean; data: { user: User } }> => {
    const response = await api.get('/auth/profile')
    return response.data
  },

  // 로그아웃
  logout: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/auth/logout')
    return response.data
  },
}

export const bookingAPI = {
  // Create a new booking
  createBooking: async (data: BookingData): Promise<BookingResponse> => {
    const response = await api.post('/bookings', data)
    return response.data
  },

  // Get all bookings
  getAllBookings: async (): Promise<{ bookings: Booking[] }> => {
    const response = await api.get('/bookings')
    return response.data
  },

  // Get specific booking
  getBooking: async (id: number): Promise<{ booking: Booking }> => {
    const response = await api.get(`/bookings/${id}`)
    return response.data
  },
}

export default api
