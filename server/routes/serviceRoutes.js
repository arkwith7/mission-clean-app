const express = require('express');
const router = express.Router();
const { authenticateToken, requireManager } = require('../middleware/auth');
const logger = require('../utils/logger');
const smsService = require('../utils/smsService');

/**
 * @swagger
 * components:
 *   schemas:
 *     Service:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 서비스 ID
 *           example: 1
 *         name:
 *           type: string
 *           description: 서비스 이름
 *           example: "벽걸이형"
 *         title:
 *           type: string
 *           description: 서비스 제목
 *           example: "벽걸이형 에어컨 청소"
 *         price:
 *           type: integer
 *           description: 현재 가격
 *           example: 80000
 *         originalPrice:
 *           type: integer
 *           description: 원래 가격
 *           example: 100000
 *         icon:
 *           type: string
 *           description: 서비스 아이콘
 *           example: "🏠"
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           description: 서비스 특징 목록
 *           example: ["벽걸이형 실내기 완전 분해 청소", "필터 교체 및 청소", "드레인 청소", "기본 점검 서비스"]
 */

// 서비스 종류 데이터
const serviceTypes = [
  {
    id: 1,
    name: '벽걸이형',
    title: '벽걸이형 에어컨 청소',
    price: 80000,
    originalPrice: 100000,
    icon: '🏠',
    features: [
      '벽걸이형 실내기 완전 분해 청소',
      '필터 교체 및 청소',
      '드레인 청소',
      '기본 점검 서비스'
    ]
  },
  {
    id: 2,
    name: '스탠드형',
    title: '스탠드형 에어컨 청소',
    price: 130000,
    originalPrice: 160000,
    icon: '🏢',
    features: [
      '스탠드형 실내기 완전 분해 청소',
      '대형 필터 교체 및 청소',
      '드레인 청소',
      '정밀 점검 서비스'
    ]
  },
  {
    id: 3,
    name: '시스템1way',
    title: '시스템 에어컨 1way 청소',
    price: 120000,
    originalPrice: 150000,
    icon: '❄️',
    features: [
      '1way 시스템 에어컨 전용 청소',
      '덕트 청소 포함',
      '항균 코팅 서비스',
      '정밀 점검 및 AS'
    ]
  },
  {
    id: 4,
    name: '시스템4way',
    title: '시스템 에어컨 천정형 4way 청소',
    price: 150000,
    originalPrice: 180000,
    icon: '❄️',
    features: [
      '천정형 4way 시스템 에어컨 청소',
      '4방향 덕트 청소 포함',
      '항균 코팅 서비스',
      '정밀 점검 및 AS'
    ]
  },
  {
    id: 5,
    name: '실외기',
    title: '실외기 청소',
    price: 60000,
    originalPrice: 75000,
    icon: '🌪️',
    features: [
      '실외기 고압 세척',
      '방열판 청소',
      '배수관 청소',
      '냉매 압력 점검'
    ]
  }
];

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: 모든 서비스 종류 조회
 *     description: Mission Clean에서 제공하는 모든 에어컨 청소 서비스 종류를 조회합니다.
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: 서비스 종류 목록 조회 성공
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
 *                     $ref: '#/components/schemas/Service'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: serviceTypes
  });
});

/**
 * @swagger
 * /api/services/{serviceId}:
 *   get:
 *     summary: 특정 서비스 정보 조회
 *     description: 서비스 ID로 특정 에어컨 청소 서비스의 상세 정보를 조회합니다.
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         description: 서비스 ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: 서비스 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Service'
 *       404:
 *         description: 서비스를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "서비스를 찾을 수 없습니다."
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:serviceId', (req, res) => {
  const serviceId = parseInt(req.params.serviceId);
  const service = serviceTypes.find(s => s.id === serviceId);
  
  if (!service) {
    return res.status(404).json({
      success: false,
      error: '서비스를 찾을 수 없습니다.'
    });
  }
  
  res.json({
    success: true,
    data: service
  });
});

/**
 * @swagger
 * /api/services/sms/status:
 *   get:
 *     summary: SMS 서비스 상태 확인
 *     description: SMS 서비스 설정 및 상태를 확인합니다. (관리자/매니저만 접근 가능)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: SMS 서비스 상태 조회 성공
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
 *                     provider:
 *                       type: string
 *                       example: "ncloud-sens"
 *                     configured:
 *                       type: boolean
 *                       example: false
 *                     enabled:
 *                       type: boolean
 *                       example: false
 *                     mode:
 *                       type: string
 *                       example: "simulation"
 *                     from:
 *                       type: string
 *                       example: "010-9171-8465"
 */
router.get('/sms/status', authenticateToken, requireManager, async (req, res) => {
  try {
    const status = smsService.getStatus();
    
    logger.info('SMS 서비스 상태 조회', { 
      userId: req.user.user_id,
      status: status
    });

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('SMS 서비스 상태 조회 중 오류', { 
      error: error.message, 
      userId: req.user?.user_id 
    });
    res.status(500).json({
      success: false,
      error: 'SMS 서비스 상태 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/services/sms/test:
 *   post:
 *     summary: SMS 테스트 발송
 *     description: 테스트 SMS를 발송합니다. (관리자/매니저만 접근 가능)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "테스트 메시지입니다."
 *               to:
 *                 type: string
 *                 example: "010-9171-8465"
 *     responses:
 *       200:
 *         description: SMS 테스트 발송 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "SMS 전송 완료 (시뮬레이션 모드)"
 */
router.post('/sms/test', authenticateToken, requireManager, async (req, res) => {
  try {
    const { message, to } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: '메시지 내용을 입력해주세요.'
      });
    }

    const recipient = to || process.env.TECHNICIAN_PHONE || '010-9171-8465';
    
    // 테스트 예약 데이터 생성
    const testBookingData = {
      booking_id: 'TEST-' + Date.now(),
      customer_name: '테스트 관리자',
      customer_phone: '010-0000-0000',
      customer_address: '테스트 주소',
      service_type: '테스트 서비스',
      service_date: new Date().toISOString().split('T')[0],
      service_time: 'morning',
      special_requests: message
    };

    const result = await smsService.sendBookingNotification(testBookingData);
    
    logger.info('SMS 테스트 발송', { 
      userId: req.user.user_id,
      to: recipient,
      result: result
    });

    res.json({
      success: result.success,
      message: result.message,
      data: {
        provider: result.provider,
        simulationMode: result.simulationMode || false
      }
    });
  } catch (error) {
    logger.error('SMS 테스트 발송 중 오류', { 
      error: error.message, 
      userId: req.user?.user_id 
    });
    res.status(500).json({
      success: false,
      error: 'SMS 테스트 발송 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router; 