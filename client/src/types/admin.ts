// 기존 예약 관련 타입들
export interface Booking {
  booking_id: number;
  customer_id: number;
  service_type: string;
  service_date: string;
  service_time: string;
  address: string;
  detailed_address?: string;
  special_instructions?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  total_amount: number;
  created_at: string;
  updated_at: string;
  customer?: Customer;
}

export interface BookingResponse {
  success: boolean;
  data: {
    bookings: Booking[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface BookingStats {
  pending: number;
  confirmed: number;
  completed: number;
  total: number;
}

// 새로운 User 관리 타입들
export interface User {
  user_id: number;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'customer';
  status: 'active' | 'inactive' | 'suspended';
  last_login?: string;
  created_at: string;
  updated_at: string;
  customers?: Customer[];
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'manager' | 'customer';
  status?: 'active' | 'inactive' | 'suspended';
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'manager' | 'customer';
  status?: 'active' | 'inactive' | 'suspended';
}

export interface UserResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface SingleUserResponse {
  success: boolean;
  data: {
    user: User;
  };
}

// 새로운 Customer 관리 타입들
export interface Customer {
  customer_id: number;
  user_id?: number;
  name: string;
  phone: string;
  email?: string;
  address: string;
  detailed_address?: string;
  age_group?: '20s' | '30s' | '40s' | '50s' | '60s+';
  gender?: 'male' | 'female' | 'other';
  customer_type: 'individual' | 'business';
  registration_source: 'website' | 'phone' | 'referral' | 'marketing';
  marketing_consent: boolean;
  sms_consent: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
  bookings?: Booking[];
  bookingCount?: number;
  lastBookingDate?: string;
}

export interface CreateCustomerData {
  user_id?: number;
  name: string;
  phone: string;
  email?: string;
  address: string;
  detailed_address?: string;
  age_group?: '20s' | '30s' | '40s' | '50s' | '60s+';
  gender?: 'male' | 'female' | 'other';
  customer_type?: 'individual' | 'business';
  registration_source?: 'website' | 'phone' | 'referral' | 'marketing';
  marketing_consent?: boolean;
  sms_consent?: boolean;
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {}

export interface CustomerResponse {
  success: boolean;
  data: {
    customers: Customer[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface SingleCustomerResponse {
  success: boolean;
  data: {
    customer: Customer;
  };
}

export interface CustomerStats {
  overview: {
    total: number;
    individual: number;
    business: number;
    marketingConsent: number;
    smsConsent: number;
  };
  monthlyNewCustomers: Array<{
    month: string;
    count: number;
  }>;
}

export interface CustomerStatsResponse {
  success: boolean;
  data: CustomerStats;
}

// 공통 API 응답 타입들
export interface ApiError {
  success: false;
  error: string;
}

export interface ApiSuccess<T = any> {
  success: true;
  message?: string;
  data?: T;
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError; 