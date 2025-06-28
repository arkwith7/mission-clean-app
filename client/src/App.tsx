import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import BookingCheckPage from './pages/BookingCheckPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboardMain from './pages/AdminDashboardMain'
import AdminBookingsPage from './pages/AdminBookingsPage'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminCustomersPage from './pages/AdminCustomersPage'
import { AuthProvider } from './contexts/AuthContext'
import { BookingProvider } from './contexts/BookingContext'

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <Router>
          <Routes>
            {/* 일반 사용자 페이지 - Header/Footer 포함 */}
            <Route path="/" element={
              <div className="min-h-screen bg-white">
                <Header />
                <HomePage />
                <Footer />
              </div>
            } />
            <Route path="/booking-check" element={
              <div className="min-h-screen bg-white">
                <Header />
                <BookingCheckPage />
                <Footer />
              </div>
            } />
            
            {/* 관리자 페이지 - Header/Footer 없음 */}
            <Route path="/admin" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardMain />} />
            <Route path="/admin/bookings" element={<AdminBookingsPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/customers" element={<AdminCustomersPage />} />
          </Routes>
        </Router>
      </BookingProvider>
    </AuthProvider>
  )
}

export default App
