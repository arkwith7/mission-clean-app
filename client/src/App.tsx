import Header from './components/Header'
import HeroSection from './components/HeroSection'
import ServicesSection from './components/ServicesSection'
import ContactSection from './components/ContactSection'
import LocationSection from './components/LocationSection'
import Footer from './components/Footer'
import FloatingCTA from './components/FloatingCTA'

function App() {
  return (
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
  )
}

export default App
