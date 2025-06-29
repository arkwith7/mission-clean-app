import { useState } from 'react'
import HeroSection from '../components/HeroSection'
import ServicesSection from '../components/ServicesSection'
import ContactSection from '../components/ContactSection'
import LocationSection from '../components/LocationSection'
import FloatingCTA from '../components/FloatingCTA'
import InquiryModal from '../components/InquiryModal'
import SmsInquiryModal from '../components/SmsInquiryModal'

const HomePage = () => {
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false)
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false)

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact')
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleInquiryClick = () => {
    setIsInquiryModalOpen(true)
  }

  const handlePhoneInquiry = () => {
    setIsInquiryModalOpen(false)
    scrollToContact()
  }

  const handleSmsInquiry = () => {
    setIsInquiryModalOpen(false)
    setIsSmsModalOpen(true)
  }

  return (
    <>
      <main>
        <HeroSection onInquiryClick={handleInquiryClick} />
        <ServicesSection onInquiryClick={handleInquiryClick} />
        <LocationSection onInquiryClick={handleInquiryClick} />
        <ContactSection />
      </main>
      
      <FloatingCTA onInquiryClick={handleInquiryClick} />
      
      {/* 문의 방법 선택 모달 */}
      <InquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        onPhoneInquiry={handlePhoneInquiry}
        onSmsInquiry={handleSmsInquiry}
      />
      
      {/* SMS 문의 모달 */}
      <SmsInquiryModal
        isOpen={isSmsModalOpen}
        onClose={() => setIsSmsModalOpen(false)}
      />
    </>
  )
}

export default HomePage 