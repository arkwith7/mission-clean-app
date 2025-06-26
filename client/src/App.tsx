import Header from './components/Header'
import HeroSection from './components/HeroSection'
import ServicesSection from './components/ServicesSection'
import ContactSection from './components/ContactSection'
import LocationSection from './components/LocationSection'
import Footer from './components/Footer'
import FloatingCTA from './components/FloatingCTA'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-white">
        <Header />
        <main>
          <HeroSection />
          <ServicesSection />
          <LocationSection />
          <ContactSection />
        </main>
        <Footer />
        <FloatingCTA />
      </div>
    </AuthProvider>
  )
}

export default App
