const express = require('express');
const router = express.Router();
const { Booking, Customer } = require('../models');
const { authenticateToken, requireManager } = require('../middleware/auth');
const logger = require('../utils/logger');
const smsService = require('../utils/smsService');

/**
 * @swagger
 * components:
 *   schemas:
 *     BookingRequest:
 *       type: object
 *       required:
 *         - name
 *         - phone
 *         - address
 *         - serviceType
 *       properties:
 *         name:
 *           type: string
 *           description: 고객명
 *           example: "홍길동"
 *         phone:
 *           type: string
 *           description: 전화번호
 *           example: "010-1234-5678"
 *         address:
 *           type: string
 *           description: 주소
 *           example: "대전광역시 중구 테스트동 123번지"
 *         serviceType:
 *           type: string
 *           description: 서비스 종류
 *           enum: [벽걸이형, 스탠드형, 시스템1way, 시스템4way, 실외기, 2대이상]
 *           example: "벽걸이형"
 *         preferredDate:
 *           type: string
 *           format: date
 *           description: 희망 날짜
 *           example: "2024-01-15"
 *         preferredTime:
 *           type: string
 *           description: 희망 시간
 *           example: "14:00"
 *         message:
 *           type: string
 *           description: 추가 요청사항
 *           example: "2층에 위치한 에어컨입니다."
 *         privacyConsent:
 *           type: boolean
 *           description: 개인정보 수집·이용 동의
 *           example: true
 *     Booking:
 *       type: object
 *       properties:
 *         booking_id:
 *           type: integer
 *           description: 예약 ID
 *         customer_id:
 *           type: integer
 *           description: 고객 ID
 *         service_type:
 *           type: string
 *           description: 서비스 종류
 *         customer_name:
 *           type: string
 *           description: 고객명
 *         customer_phone:
 *           type: string
 *           description: 전화번호
 *         customer_address:
 *           type: string
 *           description: 주소
 *         service_date:
 *           type: string
 *           format: date
 *           description: 서비스 날짜
 *         service_time:
 *           type: string
 *           description: 서비스 시간
 *         special_requests:
 *           type: string
 *           description: 특별 요청사항
 *         status:
 *           type: string
 *           enum: [pending, confirmed, completed, cancelled]
 *           description: 예약 상태
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 생성 시간
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 수정 시간
 */

// 입력값 검증 함수
const validateBookingInput = (data) => {
  const { name, phone, address, serviceType, message, privacyConsent } = data;
  const errors = [];

  // 개인정보 동의 확인
  if (privacyConsent !== true) {
    errors.push('개인정보 수집·이용에 동의해주세요.');
  }

  // 이름 검증 (2-20자)
  if (!name || name.trim().length < 2) {
    errors.push('유효한 이름을 입력해주세요.');
  } else if (name.length > 20) {
    errors.push('이름은 20자 이하로 입력해주세요.');
  }

  // 전화번호 형식 및 길이 검증 (010-1234-5678 또는 01012345678 둘 다 허용, 최대 20자)
  const phonePattern = /^010[-]?\d{4}[-]?\d{4}$/;
  if (!phone || !phonePattern.test(phone.trim())) {
    errors.push('올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678 또는 01012345678)');
  } else if (phone.length > 20) {
    errors.push('연락처는 20자 이하로 입력해주세요.');
  }

  // 주소 검증 (5-60자)
  if (!address || address.trim().length < 5) {
    errors.push('상세한 주소를 입력해주세요.');
  } else if (address.length > 60) {
    errors.push('서비스 주소는 60자 이하로 입력해주세요.');
  }

  if (!serviceType || !['벽걸이형', '스탠드형', '시스템1way', '시스템4way', '실외기', '2대이상'].includes(serviceType)) {
    errors.push('올바른 서비스 종류를 선택해주세요.');
  }

  // 메시지 길이 검증 (140자 제한)
  if (message && message.length > 140) {
    errors.push('추가 요청사항은 140자 이하로 입력해주세요.');
  }

  return errors;
};

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: 예약 신청
 *     description: 새로운 에어컨 청소 예약을 신청합니다.
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookingRequest'
 *     responses:
 *       201:
 *         description: 예약 신청 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "예약 신청이 완료되었습니다"
 *                 bookingId:
 *                   type: integer
 *                   example: 1
 *                 data:
 *                   $ref: '#/components/schemas/BookingRequest'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', async (req, res) => {
  try {
    // 받은 요청 데이터 상세 로깅
    console.log('\n' + '='.repeat(60));
    console.log('📥 새로운 예약 요청 데이터');
    console.log('='.repeat(60));
    console.log('Raw Request Body:', JSON.stringify(req.body, null, 2));
    console.log('='.repeat(60));
    
    const { name, phone, address, serviceType, preferredDate, preferredTime, message, privacyConsent } = req.body;
    
    console.log('📋 파싱된 데이터:');
    console.log(`이름: ${name}`);
    console.log(`전화번호: ${phone}`);
    console.log(`주소: ${address}`);
    console.log(`서비스 타입: ${serviceType}`);
    console.log(`희망 날짜: ${preferredDate}`);
    console.log(`희망 시간: ${preferredTime}`);
    console.log(`메시지: ${message}`);
    console.log(`개인정보 동의: ${privacyConsent}`);
    console.log('='.repeat(60) + '\n');
    
    // 입력값 검증
    const validationErrors = validateBookingInput({ name, phone, address, serviceType, message, privacyConsent });
    if (validationErrors.length > 0) {
      logger.warn('예약 신청 입력값 검증 실패', { errors: validationErrors, phone });
      return res.status(400).json({ 
        success: false,
        error: validationErrors.join(' ')
      });
    }

    // CAPTCHA 검증 (서버 측) - 임시 비활성화
    // TODO: CAPTCHA 검증 로직 수정 필요
    /*
    if (!req.session.captchaVerified) {
      logger.warn('CAPTCHA 검증되지 않은 예약 시도', { phone });
      return res.status(400).json({
        success: false,
        error: '보안 인증이 필요합니다. CAPTCHA를 먼저 완료해주세요.'
      });
    }

    // CAPTCHA 검증 만료 확인 (10분)
    const captchaAge = Date.now() - req.session.captchaVerified.timestamp;
    if (captchaAge > 10 * 60 * 1000) {
      delete req.session.captchaVerified;
      logger.warn('만료된 CAPTCHA로 예약 시도', { phone });
      return res.status(400).json({
        success: false,
        error: 'CAPTCHA 인증이 만료되었습니다. 다시 인증해주세요.'
      });
    }
    */

    // 전화번호를 표준 형식(대시 포함)으로 변환
    const formattedPhone = phone.trim().replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    console.log(`🔄 전화번호 포맷 완료: ${formattedPhone}`);
    
    // 고객 정보 생성 또는 업데이트
    console.log('🔄 고객 정보 조회/생성 시작...');
    const [customer] = await Customer.findOrCreate({
      where: { phone: formattedPhone },
      defaults: { 
        name: name.trim(), 
        address: address.trim(), 
        phone: formattedPhone 
      }
    });
    console.log(`✅ 고객 정보 처리 완료: ID ${customer.customer_id}`);

    // 예약 생성
    console.log('🔄 예약 데이터 준비 중...');
    const bookingData = {
      customer_id: customer.customer_id,
      service_type: serviceType,
      customer_name: name.trim(),
      customer_phone: formattedPhone,
      customer_address: address.trim(),
      service_date: preferredDate || null,
      service_time: preferredTime || null,
      special_requests: message ? message.trim() : null,
      status: 'pending'
    };
    console.log('📋 예약 데이터:', JSON.stringify(bookingData, null, 2));

    console.log('🔄 예약 생성 시작...');
    const booking = await Booking.create(bookingData);
    console.log(`✅ 예약 생성 완료: ID ${booking.booking_id}`);
    
    logger.info('새로운 예약이 생성되었습니다', { 
      bookingId: booking.booking_id, 
      serviceType, 
      customerPhone: phone 
    });

    // CAPTCHA 검증 상태 삭제 (한번 사용 후 무효화) - 임시 비활성화
    // delete req.session.captchaVerified;

    // 기사에게 SMS 알림 전송
    try {
      await smsService.sendBookingNotification(booking.dataValues);
      logger.info('예약 SMS 알림 전송 완료', { bookingId: booking.booking_id });
    } catch (smsError) {
      // SMS 전송 실패해도 예약은 정상 처리
      logger.warn('SMS 전송 실패 (예약은 정상 처리)', { 
        bookingId: booking.booking_id, 
        error: smsError.message 
      });
    }
    
    res.status(201).json({
      success: true,
      message: '예약 신청이 완료되었습니다',
      bookingId: booking.booking_id,
      data: {
        name,
        phone,
        address,
        serviceType,
        preferredDate,
        preferredTime,
        message
      }
    });
  } catch (error) {
    logger.error('예약 생성 중 오류', { 
      error: error.message, 
      requestBody: req.body 
    });
    res.status(500).json({ 
      success: false,
      error: '예약 처리 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * @swagger
 * /api/bookings/check:
 *   post:
 *     summary: 예약 확인 (고객용)
 *     description: 전화번호로 가장 최신 예약 정보를 확인합니다.
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 description: 전화번호
 *                 example: "010-1234-5678"
 *     responses:
 *       200:
 *         description: 예약 확인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 예약을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/check', async (req, res) => {
  try {
    const { phone } = req.body;
    
    // 입력값 검증
    if (!phone) {
      return res.status(400).json({
        success: false,
        error: '전화번호를 입력해주세요.'
      });
    }

    // 전화번호 형식 검증 (010-1234-5678 또는 01012345678 둘 다 허용)
    const phonePattern = /^010[-]?\d{4}[-]?\d{4}$/;
    if (!phonePattern.test(phone.trim())) {
      return res.status(400).json({
        success: false,
        error: '올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678 또는 01012345678)'
      });
    }

    // 전화번호를 표준 형식(대시 포함)으로 변환
    const formattedPhone = phone.trim().replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');

    // 해당 전화번호의 가장 최신 예약 조회
    const booking = await Booking.findOne({
      where: {
        customer_phone: formattedPhone
      },
      order: [['created_at', 'DESC']] // 최신 예약 우선
    });

    if (!booking) {
      logger.warn('예약 확인 실패 - 예약 없음', { phone: formattedPhone });
      return res.status(404).json({
        success: false,
        error: '해당 전화번호로 등록된 예약을 찾을 수 없습니다.'
      });
    }

    logger.info('고객 예약 확인 성공', { 
      bookingId: booking.booking_id,
      customerPhone: booking.customer_phone
    });

    res.json({
      success: true,
      data: {
        booking_id: booking.booking_id,
        customer_name: booking.customer_name,
        customer_phone: booking.customer_phone,
        customer_address: booking.customer_address,
        service_type: booking.service_type,
        service_date: booking.service_date,
        service_time: booking.service_time,
        special_requests: booking.special_requests,
        status: booking.status,
        created_at: booking.created_at
      }
    });
  } catch (error) {
    logger.error('예약 확인 중 오류', { 
      error: error.message, 
      requestBody: req.body 
    });
    res.status(500).json({
      success: false,
      error: '예약 확인 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: 예약 목록 조회
 *     description: 모든 예약 목록을 조회합니다. (관리자/매니저만 접근 가능)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 예약 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: 권한 부족
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', authenticateToken, requireManager, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Customer,
          as: 'customer'
        }
      ]
    });

    logger.info('예약 목록 조회', { 
      userId: req.user.user_id, 
      bookingCount: bookings.length 
    });

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    logger.error('예약 목록 조회 중 오류', { 
      error: error.message, 
      userId: req.user?.user_id 
    });
    res.status(500).json({
      success: false,
      error: '예약 목록을 불러오는 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/bookings/{id}/status:
 *   put:
 *     summary: 예약 상태 업데이트
 *     description: 특정 예약의 상태를 업데이트합니다. (관리자/매니저만 접근 가능)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 예약 ID
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, completed, cancelled]
 *                 example: "confirmed"
 *     responses:
 *       200:
 *         description: 상태 업데이트 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 예약을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id/status', authenticateToken, requireManager, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 상태 검증
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: '올바른 상태를 선택해주세요. (pending, confirmed, completed, cancelled)'
      });
    }

    const booking = await Booking.findByPk(id);
    if (!booking) {
      logger.warn('존재하지 않는 예약 상태 변경 시도', { bookingId: id, userId: req.user.user_id });
      return res.status(404).json({
        success: false,
        error: '예약을 찾을 수 없습니다.'
      });
    }

    await booking.update({ status });

    logger.info('예약 상태가 업데이트되었습니다', { 
      bookingId: id, 
      oldStatus: booking.status,
      newStatus: status, 
      userId: req.user.user_id 
    });

    res.json({
      success: true,
      message: '예약 상태가 업데이트되었습니다.'
    });
  } catch (error) {
    logger.error('예약 상태 업데이트 중 오류', { 
      error: error.message, 
      bookingId: req.params.id,
      userId: req.user?.user_id 
    });
    res.status(500).json({
      success: false,
      error: '상태 업데이트 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/bookings/stats/overview:
 *   get:
 *     summary: 예약 통계 조회
 *     description: 예약 현황 통계를 조회합니다. (관리자/매니저만 접근 가능)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 예약 통계 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 37
 *                         pending:
 *                           type: integer
 *                           example: 2
 *                         confirmed:
 *                           type: integer
 *                           example: 12
 *                         completed:
 *                           type: integer
 *                           example: 22
 *                         cancelled:
 *                           type: integer
 *                           example: 1
 */
router.get('/stats/overview', authenticateToken, requireManager, async (req, res) => {
  try {
    // 전체 예약 수
    const totalBookings = await Booking.count();
    
    // 상태별 예약 수
    const pendingBookings = await Booking.count({ where: { status: 'pending' } });
    const confirmedBookings = await Booking.count({ where: { status: 'confirmed' } });
    const completedBookings = await Booking.count({ where: { status: 'completed' } });
    const cancelledBookings = await Booking.count({ where: { status: 'cancelled' } });

    logger.info('예약 통계 조회', { 
      userId: req.user.user_id,
      totalBookings 
    });

    res.json({
      success: true,
      data: {
        overview: {
          total: totalBookings,
          pending: pendingBookings,
          confirmed: confirmedBookings,
          completed: completedBookings,
          cancelled: cancelledBookings
        }
      }
    });
  } catch (error) {
    logger.error('예약 통계 조회 중 오류', { 
      error: error.message, 
      userId: req.user?.user_id 
    });
    res.status(500).json({
      success: false,
      error: '예약 통계를 불러오는 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;
