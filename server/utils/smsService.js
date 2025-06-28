const logger = require('./logger');
const crypto = require('crypto');

// 기사 연락처 (환경변수로 관리 권장)
const TECHNICIAN_PHONE = process.env.TECHNICIAN_PHONE || '010-9171-8465';

// 네이버 클라우드 SENS 설정
const NCLOUD_SENS_CONFIG = {
  accessKey: process.env.NCLOUD_ACCESS_KEY || '',
  secretKey: process.env.NCLOUD_SECRET_KEY || '',
  serviceId: process.env.NCLOUD_SENS_SERVICE_ID || '',
  from: process.env.NCLOUD_SENS_FROM || '010-9171-8465', // 발신번호
  enabled: process.env.SMS_ENABLED === 'true'
};

/**
 * 네이버 클라우드 SENS 연동 SMS 알림 서비스
 * 현재는 시뮬레이션 모드로 작동하며, 발신번호 등록 완료 후 실제 SMS 발송 가능
 */
class SMSService {
  /**
   * 새로운 예약 알림을 기사에게 전송
   * @param {Object} bookingData - 예약 정보
   */
  async sendBookingNotification(bookingData) {
    try {
      const message = this.formatBookingMessage(bookingData);
      
      // SMS 전송 시뮬레이션 또는 실제 전송
      if (NCLOUD_SENS_CONFIG.enabled && this.isConfigured()) {
        return await this.sendRealSMS(TECHNICIAN_PHONE, message, bookingData.booking_id);
      } else {
        return await this.sendSimulationSMS(TECHNICIAN_PHONE, message, bookingData.booking_id);
      }
      
    } catch (error) {
      logger.error('SMS 발송 중 오류', {
        error: error.message,
        bookingId: bookingData.booking_id
      });
      return { success: false, message: 'SMS 발송 실패' };
    }
  }

  /**
   * 네이버 클라우드 SENS 설정이 완료되었는지 확인
   */
  isConfigured() {
    return !!(NCLOUD_SENS_CONFIG.accessKey && 
              NCLOUD_SENS_CONFIG.secretKey && 
              NCLOUD_SENS_CONFIG.serviceId);
  }

  /**
   * 실제 네이버 클라우드 SENS API를 통한 SMS 발송
   * @param {string} to - 수신자 번호
   * @param {string} message - 메시지 내용
   * @param {string} bookingId - 예약 ID
   */
  async sendRealSMS(to, message, bookingId) {
    try {
      // 네이버 클라우드 SENS API 호출 구현
      const axios = require('axios');
      const timestamp = Date.now().toString();
      const signature = this.generateSignature(timestamp);
      
      // 전화번호에서 하이픈 제거 (네이버 API는 숫자만 허용)
      const cleanTo = to.replace(/-/g, '');
      const cleanFrom = NCLOUD_SENS_CONFIG.from.replace(/-/g, '');

      logger.info('🚀 실제 SMS 발송 (NCLOUD SENS)', {
        to: cleanTo,
        from: cleanFrom,
        message: message,
        bookingId: bookingId,
        serviceId: NCLOUD_SENS_CONFIG.serviceId
      });

      const requestBody = {
        type: 'SMS',
        contentType: 'COMM', // 일반 메시지
        countryCode: '82',   // 한국
        from: cleanFrom,
        content: message,
        messages: [{
          to: cleanTo,
          content: message
        }]
      };

      const response = await axios.post(
        `https://sens.apigw.ntruss.com/sms/v2/services/${NCLOUD_SENS_CONFIG.serviceId}/messages`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'x-ncp-apigw-timestamp': timestamp,
            'x-ncp-iam-access-key': NCLOUD_SENS_CONFIG.accessKey,
            'x-ncp-apigw-signature-v2': signature
          }
        }
      );

      // 네이버 클라우드 SENS 응답 처리
      if (response.data.statusCode === '202') {
        logger.info('네이버 클라우드 SENS SMS 발송 성공', {
          requestId: response.data.requestId,
          statusName: response.data.statusName,
          bookingId: bookingId
        });

        return { 
          success: true, 
          message: 'SMS 발송 완료 (NCLOUD SENS)',
          provider: 'ncloud-sens',
          requestId: response.data.requestId
        };
      } else {
        throw new Error(`SMS 발송 실패: ${response.data.statusName}`);
      }

    } catch (error) {
      logger.error('네이버 클라우드 SENS SMS 발송 실패', {
        error: error.message,
        response: error.response?.data,
        bookingId: bookingId
      });
      
      // 실패시 시뮬레이션 모드로 폴백
      logger.warn('실제 SMS 발송 실패로 시뮬레이션 모드로 전환');
      return await this.sendSimulationSMS(to, message, bookingId);
    }
  }

  /**
   * 네이버 클라우드 SENS API 서명 생성
   * @param {string} timestamp - 타임스탬프
   */
  generateSignature(timestamp) {
    const method = 'POST';
    const url = `/sms/v2/services/${NCLOUD_SENS_CONFIG.serviceId}/messages`;
    
    const message = `${method} ${url}\n${timestamp}\n${NCLOUD_SENS_CONFIG.accessKey}`;
    
    return crypto
      .createHmac('sha256', NCLOUD_SENS_CONFIG.secretKey)
      .update(message)
      .digest('base64');
  }

  /**
   * SMS 발송 시뮬레이션 (개발/테스트용)
   * @param {string} to - 수신자 번호
   * @param {string} message - 메시지 내용
   * @param {string} bookingId - 예약 ID
   */
  async sendSimulationSMS(to, message, bookingId) {
    // 실제 SMS처럼 약간의 지연 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 500));

    logger.info('📱 SMS 알림 (시뮬레이션 모드)', {
      provider: 'ncloud-sens-simulation',
      to: to,
      from: NCLOUD_SENS_CONFIG.from,
      message: message,
      bookingId: bookingId,
      timestamp: new Date().toISOString()
    });
    
    // 콘솔에도 명확히 표시
    console.log('\n' + '='.repeat(80));
    console.log('📱 [시뮬레이션] 네이버 클라우드 SENS SMS 발송');
    console.log('='.repeat(80));
    console.log(`🔹 발신자: ${NCLOUD_SENS_CONFIG.from}`);
    console.log(`🔹 수신자: ${to}`);
    console.log(`🔹 예약ID: ${bookingId}`);
    console.log(`🔹 발송시간: ${new Date().toLocaleString('ko-KR')}`);
    console.log('🔹 메시지 내용:');
    console.log('━'.repeat(40));
    console.log(message);
    console.log('━'.repeat(40));
    console.log('💡 실제 SMS 발송을 위해서는 네이버 클라우드 SENS 설정이 필요합니다.');
    console.log('   1. 발신번호 등록 (010-9171-8465)');
    console.log('   2. 환경변수 설정: NCLOUD_ACCESS_KEY, NCLOUD_SECRET_KEY, NCLOUD_SENS_SERVICE_ID');
    console.log('   3. SMS_ENABLED=true 설정');
    console.log('='.repeat(80) + '\n');
    
    return { 
      success: true, 
      message: 'SMS 전송 완료 (시뮬레이션 모드)',
      provider: 'simulation',
      simulationMode: true
    };
  }

  /**
   * 시간 코드를 한국어 설명으로 변환
   * @param {string} timeCode - 시간 코드 (morning, afternoon, evening, consultation)
   * @returns {string} 한국어 시간 설명
   */
  formatTimeDescription(timeCode) {
    const timeMap = {
      'morning': '오전 (9시-12시)',
      'afternoon': '오후 (1시-5시)', 
      'evening': '저녁 (5시-7시)',
      'consultation': '상담 후 결정'
    };
    
    return timeMap[timeCode] || timeCode;
  }

  /**
   * 예약 정보를 SMS 메시지 형태로 포맷팅
   * @param {Object} bookingData - 예약 정보
   * @returns {string} 포맷팅된 메시지
   */
  formatBookingMessage(bookingData) {
    const {
      booking_id,
      customer_name,
      customer_phone,
      customer_address,
      service_type,
      service_date,
      service_time,
      special_requests
    } = bookingData;

    let message = `🔔 [Mission Clean] 새로운 예약!\n\n`;
    message += `📋 예약번호: ${booking_id}\n`;
    message += `👤 고객명: ${customer_name}\n`;
    message += `📞 연락처: ${customer_phone}\n`;
    message += `📍 주소: ${customer_address}\n`;
    message += `🔧 서비스: ${service_type}\n`;
    
    if (service_date) {
      message += `📅 희망일: ${service_date}\n`;
    }
    
    if (service_time) {
      const formattedTime = this.formatTimeDescription(service_time);
      message += `⏰ 희망시간: ${formattedTime}\n`;
    }
    
    if (special_requests) {
      message += `💬 요청사항: ${special_requests}\n`;
    }
    
    message += `\n빠른 상담 부탁드립니다! 📞`;
    message += `\nwww.aircleankorea.com`;
    
    return message;
  }

  /**
   * SMS 서비스 상태 확인
   */
  getStatus() {
    return {
      provider: 'ncloud-sens',
      configured: this.isConfigured(),
      enabled: NCLOUD_SENS_CONFIG.enabled,
      mode: NCLOUD_SENS_CONFIG.enabled && this.isConfigured() ? 'production' : 'simulation',
      from: NCLOUD_SENS_CONFIG.from
    };
  }
}

module.exports = new SMSService(); 