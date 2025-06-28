import { useState, useEffect, useMemo } from 'react'
import { customerAPI } from '../../services/api'
import type { Customer, CreateCustomerData, UpdateCustomerData } from '../../types/admin'

const CustomerManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  
  // 모달 상태
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  
  // 검색 및 필터 상태
  const [searchTerm, setSearchTerm] = useState('')
  const [customerTypeFilter, setCustomerTypeFilter] = useState<string>('all')
  const [ageGroupFilter, setAgeGroupFilter] = useState<string>('all')
  const [registrationSourceFilter, setRegistrationSourceFilter] = useState<string>('all')
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // 폼 상태
  const [formData, setFormData] = useState<CreateCustomerData>({
    name: '',
    phone: '',
    email: '',
    address: '',
    detailed_address: '',
    age_group: undefined,
    gender: undefined,
    customer_type: 'individual',
    registration_source: 'website',
    marketing_consent: false,
    sms_consent: false
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setIsLoading(true)
      const response = await customerAPI.getCustomers()
      console.log('🏢 [CustomerManagement] API 응답:', response)
      setCustomers(response.data.customers || [])
    } catch (error: unknown) {
      console.error('고객 목록 조회 오류:', error)
      setError('고객 목록을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const getCustomerTypeText = (type: string) => {
    switch (type) {
      case 'individual': return '개인'
      case 'business': return '기업'
      default: return type
    }
  }

  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case 'individual': return 'bg-blue-100 text-blue-800'
      case 'business': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAgeGroupText = (ageGroup?: string) => {
    if (!ageGroup) return '-'
    switch (ageGroup) {
      case '20s': return '20대'
      case '30s': return '30대'
      case '40s': return '40대'
      case '50s': return '50대'
      case '60s+': return '60대+'
      default: return ageGroup
    }
  }

  const getGenderText = (gender?: string) => {
    if (!gender) return '-'
    switch (gender) {
      case 'male': return '남성'
      case 'female': return '여성'
      case 'other': return '기타'
      default: return gender
    }
  }

  const getRegistrationSourceText = (source: string) => {
    switch (source) {
      case 'website': return '웹사이트'
      case 'phone': return '전화'
      case 'referral': return '추천'
      case 'marketing': return '마케팅'
      default: return source
    }
  }

  // 필터링된 고객 목록
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch = searchTerm === '' || 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.address.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCustomerType = customerTypeFilter === 'all' || customer.customer_type === customerTypeFilter
      const matchesAgeGroup = ageGroupFilter === 'all' || customer.age_group === ageGroupFilter
      const matchesRegistrationSource = registrationSourceFilter === 'all' || customer.registration_source === registrationSourceFilter
      
      return matchesSearch && matchesCustomerType && matchesAgeGroup && matchesRegistrationSource
    })
  }, [customers, searchTerm, customerTypeFilter, ageGroupFilter, registrationSourceFilter])

  // 페이지네이션된 고객 목록
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredCustomers.slice(startIndex, endIndex)
  }, [filteredCustomers, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setError('')
      setSuccessMessage('')
      
      await customerAPI.createCustomer(formData)
      
      setSuccessMessage('고객이 성공적으로 등록되었습니다.')
      setIsCreateModalOpen(false)
      resetFormData()
      
      setTimeout(() => setSuccessMessage(''), 3000)
      await fetchCustomers()
    } catch (error: unknown) {
      console.error('고객 생성 오류:', error)
      const errorMessage = error instanceof Error && 'response' in error && 
        typeof error.response === 'object' && error.response !== null &&
        'data' in error.response && typeof error.response.data === 'object' &&
        error.response.data !== null && 'error' in error.response.data &&
        typeof error.response.data.error === 'string'
        ? error.response.data.error
        : '고객 등록 중 오류가 발생했습니다.'
      setError(errorMessage)
    }
  }

  const handleEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomer) return
    
    try {
      setError('')
      setSuccessMessage('')
      
      const updateData: UpdateCustomerData = { ...formData }
      
      await customerAPI.updateCustomer(selectedCustomer.customer_id, updateData)
      
      setSuccessMessage('고객 정보가 성공적으로 수정되었습니다.')
      setIsEditModalOpen(false)
      setSelectedCustomer(null)
      
      setTimeout(() => setSuccessMessage(''), 3000)
      await fetchCustomers()
    } catch (error: unknown) {
      console.error('고객 수정 오류:', error)
      const errorMessage = error instanceof Error && 'response' in error && 
        typeof error.response === 'object' && error.response !== null &&
        'data' in error.response && typeof error.response.data === 'object' &&
        error.response.data !== null && 'error' in error.response.data &&
        typeof error.response.data.error === 'string'
        ? error.response.data.error
        : '고객 정보 수정 중 오류가 발생했습니다.'
      setError(errorMessage)
    }
  }

  const handleDeleteCustomer = async (customer: Customer) => {
    if (!confirm(`정말로 "${customer.name}" 고객을 삭제하시겠습니까?`)) return
    
    try {
      setError('')
      setSuccessMessage('')
      
      await customerAPI.deleteCustomer(customer.customer_id)
      
      setSuccessMessage(`"${customer.name}" 고객이 성공적으로 삭제되었습니다.`)
      
      setTimeout(() => setSuccessMessage(''), 3000)
      await fetchCustomers()
    } catch (error: unknown) {
      console.error('고객 삭제 오류:', error)
      const errorMessage = error instanceof Error && 'response' in error && 
        typeof error.response === 'object' && error.response !== null &&
        'data' in error.response && typeof error.response.data === 'object' &&
        error.response.data !== null && 'error' in error.response.data &&
        typeof error.response.data.error === 'string'
        ? error.response.data.error
        : '고객 삭제 중 오류가 발생했습니다.'
      setError(errorMessage)
    }
  }

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer)
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address,
      detailed_address: customer.detailed_address || '',
      age_group: customer.age_group,
      gender: customer.gender,
      customer_type: customer.customer_type,
      registration_source: customer.registration_source,
      marketing_consent: customer.marketing_consent,
      sms_consent: customer.sms_consent
    })
    setIsEditModalOpen(true)
  }

  const resetFormData = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      detailed_address: '',
      age_group: undefined,
      gender: undefined,
      customer_type: 'individual',
      registration_source: 'website',
      marketing_consent: false,
      sms_consent: false
    })
  }

  const closeModals = () => {
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setSelectedCustomer(null)
    resetFormData()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">고객 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <span className="text-3xl mr-3">🏢</span>
          고객 관리
        </h1>
        <p className="text-gray-600 mt-1">고객 정보를 등록하고 관리할 수 있습니다.</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">🔍 검색 및 필터</h3>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            ➕ 새 고객 추가
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 검색창 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">검색</label>
            <input
              type="text"
              placeholder="이름, 전화번호, 이메일, 주소"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 고객 유형 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">고객 유형</label>
            <select
              value={customerTypeFilter}
              onChange={(e) => setCustomerTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">전체</option>
              <option value="individual">개인</option>
              <option value="business">기업</option>
            </select>
          </div>

          {/* 연령대 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">연령대</label>
            <select
              value={ageGroupFilter}
              onChange={(e) => setAgeGroupFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">전체</option>
              <option value="20s">20대</option>
              <option value="30s">30대</option>
              <option value="40s">40대</option>
              <option value="50s">50대</option>
              <option value="60s+">60대+</option>
            </select>
          </div>

          {/* 등록 경로 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">등록 경로</label>
            <select
              value={registrationSourceFilter}
              onChange={(e) => setRegistrationSourceFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">전체</option>
              <option value="website">웹사이트</option>
              <option value="phone">전화</option>
              <option value="referral">추천</option>
              <option value="marketing">마케팅</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">🏢 고객 목록</h2>
          <div className="text-sm text-gray-600 flex items-center space-x-4">
            <span>총 {customers.length}명 중 {filteredCustomers.length}명 표시</span>
            <button
              onClick={fetchCustomers}
              className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-xs"
            >
              🔄 새로고침
            </button>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        {successMessage && (
          <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">{successMessage}</p>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  고객 정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  연락처
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  유형/연령/성별
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  예약 수
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  동의 현황
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  등록일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <div className="text-4xl mb-2">🏢</div>
                    <p>검색 조건에 맞는 고객이 없습니다.</p>
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((customer) => (
                  <tr key={customer.customer_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{customer.customer_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.address}</div>
                        {customer.detailed_address && (
                          <div className="text-xs text-gray-400">{customer.detailed_address}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{customer.phone}</div>
                        {customer.email && (
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCustomerTypeColor(customer.customer_type)}`}>
                          {getCustomerTypeText(customer.customer_type)}
                        </span>
                        <div className="text-xs text-gray-500">
                          {getAgeGroupText(customer.age_group)} / {getGenderText(customer.gender)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="text-center">
                        <div className="text-lg font-bold">{customer.bookingCount || 0}</div>
                        <div className="text-xs text-gray-500">건</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-2 ${customer.marketing_consent ? 'bg-green-400' : 'bg-gray-300'}`}></span>
                          <span className="text-xs">마케팅</span>
                        </div>
                        <div className="flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-2 ${customer.sms_consent ? 'bg-green-400' : 'bg-gray-300'}`}></span>
                          <span className="text-xs">SMS</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div>{new Date(customer.created_at).toLocaleDateString('ko-KR')}</div>
                        <div className="text-xs">{getRegistrationSourceText(customer.registration_source)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button 
                        onClick={() => openEditModal(customer)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                      >
                        수정
                      </button>
                      <button 
                        onClick={() => handleDeleteCustomer(customer)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                페이지 {currentPage} / {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  이전
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  다음
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Customer Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">새 고객 추가</h3>
            </div>
            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">전화번호 *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">고객 유형</label>
                  <select
                    value={formData.customer_type}
                    onChange={(e) => setFormData({...formData, customer_type: e.target.value as 'individual' | 'business'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="individual">개인</option>
                    <option value="business">기업</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">연령대</label>
                  <select
                    value={formData.age_group || ''}
                    onChange={(e) => setFormData({...formData, age_group: e.target.value as any || undefined})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">선택하지 않음</option>
                    <option value="20s">20대</option>
                    <option value="30s">30대</option>
                    <option value="40s">40대</option>
                    <option value="50s">50대</option>
                    <option value="60s+">60대+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">성별</label>
                  <select
                    value={formData.gender || ''}
                    onChange={(e) => setFormData({...formData, gender: e.target.value as any || undefined})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">선택하지 않음</option>
                    <option value="male">남성</option>
                    <option value="female">여성</option>
                    <option value="other">기타</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">주소 *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">상세 주소</label>
                <input
                  type="text"
                  value={formData.detailed_address}
                  onChange={(e) => setFormData({...formData, detailed_address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">등록 경로</label>
                <select
                  value={formData.registration_source}
                  onChange={(e) => setFormData({...formData, registration_source: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="website">웹사이트</option>
                  <option value="phone">전화</option>
                  <option value="referral">추천</option>
                  <option value="marketing">마케팅</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="marketing_consent"
                    checked={formData.marketing_consent}
                    onChange={(e) => setFormData({...formData, marketing_consent: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="marketing_consent" className="text-sm text-gray-700">마케팅 수신 동의</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sms_consent"
                    checked={formData.sms_consent}
                    onChange={(e) => setFormData({...formData, sms_consent: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="sms_consent" className="text-sm text-gray-700">SMS 수신 동의</label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {isEditModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">고객 정보 수정</h3>
            </div>
            <form onSubmit={handleEditCustomer} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">전화번호 *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">고객 유형</label>
                  <select
                    value={formData.customer_type}
                    onChange={(e) => setFormData({...formData, customer_type: e.target.value as 'individual' | 'business'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="individual">개인</option>
                    <option value="business">기업</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">연령대</label>
                  <select
                    value={formData.age_group || ''}
                    onChange={(e) => setFormData({...formData, age_group: e.target.value as any || undefined})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">선택하지 않음</option>
                    <option value="20s">20대</option>
                    <option value="30s">30대</option>
                    <option value="40s">40대</option>
                    <option value="50s">50대</option>
                    <option value="60s+">60대+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">성별</label>
                  <select
                    value={formData.gender || ''}
                    onChange={(e) => setFormData({...formData, gender: e.target.value as any || undefined})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">선택하지 않음</option>
                    <option value="male">남성</option>
                    <option value="female">여성</option>
                    <option value="other">기타</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">주소 *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">상세 주소</label>
                <input
                  type="text"
                  value={formData.detailed_address}
                  onChange={(e) => setFormData({...formData, detailed_address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">등록 경로</label>
                <select
                  value={formData.registration_source}
                  onChange={(e) => setFormData({...formData, registration_source: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="website">웹사이트</option>
                  <option value="phone">전화</option>
                  <option value="referral">추천</option>
                  <option value="marketing">마케팅</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit_marketing_consent"
                    checked={formData.marketing_consent}
                    onChange={(e) => setFormData({...formData, marketing_consent: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="edit_marketing_consent" className="text-sm text-gray-700">마케팅 수신 동의</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit_sms_consent"
                    checked={formData.sms_consent}
                    onChange={(e) => setFormData({...formData, sms_consent: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="edit_sms_consent" className="text-sm text-gray-700">SMS 수신 동의</label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  수정
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerManagement 