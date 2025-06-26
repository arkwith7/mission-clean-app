const express = require('express');
const router = express.Router();
const { Booking, Customer } = require('../models');
const { authenticateToken, requireManager } = require('../middleware/auth');
const logger = require('../utils/logger');

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
  const { name, phone, address, serviceType } = data;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('유효한 이름을 입력해주세요.');
  }

  if (!phone || !/^010-\d{4}-\d{4}$/.test(phone.trim())) {
    errors.push('올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)');
  }

  if (!address || address.trim().length < 5) {
    errors.push('상세한 주소를 입력해주세요.');
  }

  if (!serviceType || !['벽걸이형', '스탠드형', '시스템1way', '시스템4way', '실외기', '2대이상'].includes(serviceType)) {
    errors.push('올바른 서비스 종류를 선택해주세요.');
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
    const { name, phone, address, serviceType, preferredDate, preferredTime, message } = req.body;
    
    // 입력값 검증
    const validationErrors = validateBookingInput({ name, phone, address, serviceType });
    if (validationErrors.length > 0) {
      logger.warn('예약 신청 입력값 검증 실패', { errors: validationErrors, phone });
      return res.status(400).json({ 
        success: false,
        error: validationErrors.join(' ')
      });
    }

    // 고객 정보 생성 또는 업데이트
    const [customer] = await Customer.findOrCreate({
      where: { phone: phone.trim() },
      defaults: { 
        name: name.trim(), 
        address: address.trim(), 
        phone: phone.trim() 
      }
    });

    // 예약 생성
    const bookingData = {
      customer_id: customer.customer_id,
      service_type: serviceType,
      customer_name: name.trim(),
      customer_phone: phone.trim(),
      customer_address: address.trim(),
      service_date: preferredDate || null,
      service_time: preferredTime || null,
      special_requests: message ? message.trim() : null,
      status: 'pending'
    };

    const booking = await Booking.create(bookingData);
    
    logger.info('새로운 예약이 생성되었습니다', { 
      bookingId: booking.booking_id, 
      serviceType, 
      customerPhone: phone 
    });
    
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

module.exports = router;
