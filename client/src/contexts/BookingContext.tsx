import { createContext, useContext, useState, ReactNode } from 'react'

export interface ServiceInfo {
  serviceType: string
  serviceName: string
  price: string
  description?: string
}

interface BookingContextType {
  selectedService: ServiceInfo | null
  setSelectedService: (service: ServiceInfo) => void
  scrollToBooking: () => void
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

export const useBooking = () => {
  const context = useContext(BookingContext)
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider')
  }
  return context
}

interface BookingProviderProps {
  children: ReactNode
}

export const BookingProvider = ({ children }: BookingProviderProps) => {
  const [selectedService, setSelectedService] = useState<ServiceInfo | null>(null)

  const handleSetSelectedService = (service: ServiceInfo) => {
    setSelectedService(service)
    // 서비스 선택 후 예약 폼으로 스크롤
    setTimeout(() => {
      scrollToBooking()
    }, 100)
  }

  const scrollToBooking = () => {
    const contactElement = document.getElementById('contact')
    if (contactElement) {
      contactElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <BookingContext.Provider 
      value={{
        selectedService,
        setSelectedService: handleSetSelectedService,
        scrollToBooking
      }}
    >
      {children}
    </BookingContext.Provider>
  )
} 