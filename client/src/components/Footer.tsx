import { useState } from 'react'
import PrivacyPolicyModal from './PrivacyPolicyModal'

const Footer = () => {
  const [showPrivacyPolicyModal, setShowPrivacyPolicyModal] = useState(false)

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <span className="text-2xl font-bold text-blue-400">🧹 Mission Clean</span>
            </div>
            <p className="text-gray-300 mb-4">
              대전 중구를 중심으로 충청권 전 지역에 전문 에어컨 청소 서비스를 제공하는 
              믿을 수 있는 청소 전문 업체입니다.
            </p>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center">
                <span className="text-blue-400 mr-2">📍</span>
                <span>대전광역시 중구 동서대로 1435</span>
              </div>
              <div className="flex items-center">
                <span className="text-blue-400 mr-2">📞</span>
                <button 
                  onClick={() => {
                    const contactElement = document.getElementById('contact');
                    if (contactElement) {
                      contactElement.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="hover:text-blue-400 transition-colors text-left"
                >
                  예약문의 (온라인 접수)
                </button>
              </div>
              <div className="flex items-center">
                <span className="text-blue-400 mr-2">📧</span>
                <span>info@aircleankorea.com</span>
              </div>
              <div className="flex items-center">
                <span className="text-blue-400 mr-2">🌐</span>
                <span>www.aircleankorea.com</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">서비스 안내</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#services" className="hover:text-blue-400 transition-colors">
                  일반형 에어컨 청소
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-blue-400 transition-colors">
                  시스템 에어컨 청소
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-blue-400 transition-colors">
                  실외기 청소
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-blue-400 transition-colors">
                  항균 코팅 서비스
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-blue-400 transition-colors">
                  정밀 점검 및 AS
                </a>
              </li>
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h3 className="text-lg font-semibold mb-4">서비스 지역</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#location" className="hover:text-blue-400 transition-colors">
                  대전 중구 (20분 내)
                </a>
              </li>
              <li>
                <a href="#location" className="hover:text-blue-400 transition-colors">
                  대전 전 지역 (30분 내)
                </a>
              </li>
              <li>
                <a href="#location" className="hover:text-blue-400 transition-colors">
                  세종시
                </a>
              </li>
              <li>
                <a href="#location" className="hover:text-blue-400 transition-colors">
                  청주시
                </a>
              </li>
              <li>
                <a href="#location" className="hover:text-blue-400 transition-colors">
                  천안시
                </a>
              </li>
              <li>
                <a href="#location" className="hover:text-blue-400 transition-colors">
                  기타 충청권
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Business Info */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">사업자 정보</h3>
              <div className="space-y-2 text-gray-300 text-sm">
                <div>사업자등록번호: (추후 입력)</div>
                <div>대표자: (추후 입력)</div>
                <div>통신판매업신고: (추후 입력)</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">인증 및 협력</h3>
              <div className="space-y-2 text-gray-300 text-sm">
                <div>• 대전시 소상공인 지원사업 참여</div>
                <div>• 중구청 협력 업체</div>
                <div>• 대전상공회의소 회원사</div>
                <div>• 대전 아파트 관리사무소 20곳 협력</div>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="bg-blue-900 rounded-lg p-6 text-center">
            <h3 className="text-xl font-bold mb-2">🚨 24시간 응급 출동</h3>
            <p className="text-blue-200 mb-4">
              에어컨 고장, 응급 청소가 필요하신가요?
            </p>
            <button 
              onClick={() => {
                const contactElement = document.getElementById('contact');
                if (contactElement) {
                  contactElement.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="inline-block bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              📞 예약문의 하기
            </button>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 Mission Clean. All rights reserved. | 
            대전광역시 중구 동서대로 1435 | 
            온라인 예약 문의 | 
            www.aircleankorea.com
          </p>
          <div className="flex justify-center items-center space-x-4 mt-3 text-xs">
            <button
              onClick={() => setShowPrivacyPolicyModal(true)}
              className="text-blue-400 hover:text-blue-300 underline transition-colors"
            >
              개인정보처리방침
            </button>
            <span className="text-gray-500">|</span>
            <span className="text-gray-500">
              개인정보보호책임자: info@aircleankorea.com
            </span>
          </div>
          <p className="text-gray-500 text-xs mt-2">
            본 웹사이트의 모든 콘텐츠는 저작권법의 보호를 받습니다.
          </p>
        </div>
      </div>

      {/* 개인정보처리방침 모달 */}
      <PrivacyPolicyModal
        isOpen={showPrivacyPolicyModal}
        onClose={() => setShowPrivacyPolicyModal(false)}
      />
    </footer>
  )
}

export default Footer
