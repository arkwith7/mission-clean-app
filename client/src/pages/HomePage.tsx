import HeroSection from '../components/HeroSection'
import ServicesSection from '../components/ServicesSection'
import ContactSection from '../components/ContactSection'
import LocationSection from '../components/LocationSection'
import FloatingCTA from '../components/FloatingCTA'

const HomePage = () => {
  return (
    <>
      <main>
        <HeroSection />
        <ServicesSection />
        <LocationSection />
        <ContactSection />
      </main>
      <FloatingCTA />
    </>
  )
}

export default HomePage 