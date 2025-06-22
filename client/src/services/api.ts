import axios from 'axios'

const API_BASE_URL = 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
