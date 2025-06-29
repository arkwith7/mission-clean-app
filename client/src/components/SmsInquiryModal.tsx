import { useState, useEffect } from 'react'
import { generateMathCaptcha, verifyCaptcha, type CaptchaChallenge } from '../utils/captcha'
import PrivacyConsentModal from './PrivacyConsentModal'
import PrivacyPolicyModal from './PrivacyPolicyModal'

interface SmsInquiryModalProps {
  isOpen: boolean
  onClose: () => void
}

interface SmsFormData {
  name: string
  phone: string
  serviceType: string
  message: string
}

const SmsInquiryModal = ({ isOpen, onClose }: SmsInquiryModalProps) => {
  const [formData, setFormData] = useState<SmsFormData>({
    name: '',
    phone: '',
    serviceType: '',
    message: ''
  })
  
  const [captcha, setCaptcha] = useState<CaptchaChallenge | null>(null)
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [captchaError, setCaptchaError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  // 개인정보 동의 관련 상태
  const [privacyConsent, setPrivacyConsent] = useState(false)
  const [showPrivacyConsentModal, setShowPrivacyConsentModal] = useState(false)
  const [showPrivacyPolicyModal, setShowPrivacyPolicyModal] = useState(false)

  // CAPTCHA 생성
  useEffect(() => {
    if (isOpen) {
      setCaptcha(generateMathCaptcha())
      setIsSuccess(false)
    }
  }, [isOpen])

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCaptchaRefresh = () => {
    setCaptcha(generateMathCaptcha())
    setCaptchaAnswer('')
    setCaptchaError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 개인정보 동의 확인
    if (!privacyConsent) {
      alert('개인정보 수집·이용에 동의해주세요.')
      return
    }
    
    // CAPTCHA 검증
    if (!captcha || !verifyCaptcha(captchaAnswer, captcha.answer as number)) {
      setCaptchaError('보안 문자를 다시 확인해주세요.')
      return
    }
    
    setCaptchaError('')
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/sms/inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          privacyConsent: privacyConsent
        }),
      })

      if (!response.ok) {
        throw new Error('SMS 전송에 실패했습니다.')
      }

      setIsSuccess(true)
      
      // 폼 초기화
      setFormData({
        name: '',
        phone: '',
        serviceType: '',
        message: ''
      })
      setPrivacyConsent(false)
      setCaptcha(generateMathCaptcha())
      setCaptchaAnswer('')
      
    } catch (error) {
      console.error('SMS 전송 오류:', error)
      alert('문자 전송 중 오류가 발생했습니다. 온라인 예약을 이용해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
      // 모달 닫을 때 초기화
      setTimeout(() => {
        setFormData({
          name: '',
          phone: '',
          serviceType: '',
          message: ''
        })
        setPrivacyConsent(false)
        setCaptchaAnswer('')
        setCaptchaError('')
        setIsSuccess(false)
      }, 300)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />
      
      <div 
        className="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-auto max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">
              💬 문자 메시지 문의
            </h3>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            간단한 정보를 입력하시면 1시간 내 문자로 답변드립니다
          </p>
        </div>

        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <h4 className="text-2xl font-bold text-green-600 mb-4">
                문자 문의 완료!
              </h4>
              <p className="text-gray-600 mb-6">
                문의사항을 접수했습니다.<br />
                1시간 내에 문자로 답변드리겠습니다.
              </p>
              <button
                onClick={handleClose}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                확인
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    이름 * (최대 20자)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      maxLength={20}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-16"
                      placeholder="홍길동"
                    />
                    <div className="absolute top-1/2 right-2 transform -translate-y-1/2 text-xs text-gray-500 bg-white px-1 rounded">
                      {formData.name.length}/20
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    연락처 * (최대 20자)
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      maxLength={20}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-16"
                      placeholder="010-1234-5678"
                    />
                    <div className="absolute top-1/2 right-2 transform -translate-y-1/2 text-xs text-gray-500 bg-white px-1 rounded">
                      {formData.phone.length}/20
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  관심 서비스
                </label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">서비스를 선택해주세요</option>
                  <option value="벽걸이형">벽걸이형 에어컨 청소 (80,000원)</option>
                  <option value="스탠드형">스탠드형 에어컨 청소 (130,000원)</option>
                  <option value="시스템1way">시스템 에어컨 1way 청소 (120,000원)</option>
                  <option value="시스템4way">시스템 에어컨 천정형 4way 청소 (150,000원)</option>
                  <option value="실외기">실외기 청소 (60,000원)</option>
                  <option value="2대이상">2대 이상 (상담 후 결정)</option>
                  <option value="상담">상담만 원함</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  문의 내용
                </label>
                <div className="relative">
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    maxLength={140}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-16"
                    placeholder="궁금한 점이나 요청사항을 적어주세요 (최대 140자)"
                  />
                  <div className="absolute bottom-2 right-2 text-sm text-gray-500 bg-white px-1 rounded">
                    {formData.message.length}/140
                  </div>
                </div>
              </div>

              {/* 개인정보 동의 섹션 */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-3">🔒 개인정보 수집·이용 동의</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="sms-privacy-consent"
                      checked={privacyConsent}
                      onChange={(e) => setPrivacyConsent(e.target.checked)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      required
                    />
                    <label htmlFor="sms-privacy-consent" className="text-sm text-blue-700 flex-1">
                      <span className="font-semibold">[필수]</span> 개인정보 수집·이용에 동의합니다.
                      <div className="text-xs text-blue-600 mt-1">
                        수집 목적: SMS 문의 상담 서비스 제공 | 수집 항목: 이름, 연락처, 문의내용 | 보유 기간: 서비스 완료 후 1년
                      </div>
                    </label>
                  </div>
                  <div className="flex space-x-2 text-sm">
                    <button
                      type="button"
                      onClick={() => setShowPrivacyConsentModal(true)}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      자세한 내용 보기
                    </button>
                    <span className="text-gray-400">|</span>
                    <button
                      type="button"
                      onClick={() => setShowPrivacyPolicyModal(true)}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      개인정보처리방침
                    </button>
                  </div>
                </div>
              </div>

              {/* CAPTCHA 섹션 */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-3">🔒 보안 확인</h4>
                {captcha && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-white px-4 py-2 rounded border border-gray-300 font-mono text-lg min-w-0 flex-1">
                        {captcha.question}
                      </div>
                      <button
                        type="button"
                        onClick={handleCaptchaRefresh}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition-colors"
                        title="새로운 보안 문자 생성"
                      >
                        🔄
                      </button>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={captchaAnswer}
                        onChange={(e) => {
                          setCaptchaAnswer(e.target.value)
                          setCaptchaError('')
                        }}
                        placeholder="위의 계산 결과를 입력하세요"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                    {captchaError && (
                      <p className="text-red-600 text-sm">{captchaError}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-bold text-green-800 mb-2">📱 문자 문의 안내</h4>
                <ul className="text-green-700 space-y-1 text-sm">
                  <li>• 1시간 내 문자로 답변</li>
                  <li>• 정확한 견적 및 일정 안내</li>
                  <li>• 7월 특가 20% 할인 적용</li>
                  <li>• 대전 중구 추가 10% 할인</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-lg transition-colors text-lg"
              >
                {isSubmitting ? '📤 전송 중...' : '📤 문자 문의 보내기'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 개인정보 동의서 모달 */}
      <PrivacyConsentModal
        isOpen={showPrivacyConsentModal}
        onClose={() => setShowPrivacyConsentModal(false)}
        onAgree={() => {
          setPrivacyConsent(true)
          setShowPrivacyConsentModal(false)
        }}
        type="sms"
      />

      {/* 개인정보처리방침 모달 */}
      <PrivacyPolicyModal
        isOpen={showPrivacyPolicyModal}
        onClose={() => setShowPrivacyPolicyModal(false)}
      />
    </div>
  )
}

export default SmsInquiryModal 