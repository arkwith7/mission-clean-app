const express = require('express');
const { Op } = require('sequelize');
const { User, Customer, Booking, sequelize } = require('../models');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: 대시보드 통계 조회
 *     description: 관리자 대시보드에 표시할 전체 통계 데이터를 조회합니다.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 대시보드 통계 조회 성공
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
 *                     bookings:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         pending:
 *                           type: integer
 *                         confirmed:
 *                           type: integer
 *                         completed:
 *                           type: integer
 *                         cancelled:
 *                           type: integer
 *                     users:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         admin:
 *                           type: integer
 *                         manager:
 *                           type: integer
 *                         customer:
 *                           type: integer
 *                         active:
 *                           type: integer
 *                     customers:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         individual:
 *                           type: integer
 *                         corporate:
 *                           type: integer
 *                         marketingConsent:
 *                           type: integer
 *                         smsConsent:
 *                           type: integer
 */
router.get('/stats', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    // 예약 통계
    const bookingStats = await Promise.all([
      Booking.count(), // 전체
      Booking.count({ where: { status: 'pending' } }), // 대기중
      Booking.count({ where: { status: 'confirmed' } }), // 확정
      Booking.count({ where: { status: 'completed' } }), // 완료
      Booking.count({ where: { status: 'cancelled' } }) // 취소
    ]);

    // 사용자 통계
    const userStats = await Promise.all([
      User.count(), // 전체
      User.count({ where: { role: 'admin' } }), // 관리자
      User.count({ where: { role: 'manager' } }), // 매니저
      User.count({ where: { role: 'customer' } }), // 고객
      User.count({ where: { status: 'active' } }) // 활성
    ]);

    // 고객 통계
    const customerStats = await Promise.all([
      Customer.count(), // 전체
      Customer.count({ where: { customer_type: 'individual' } }), // 개인
      Customer.count({ where: { customer_type: 'business' } }), // 기업
      Customer.count({ where: { marketing_consent: true } }), // 마케팅 동의
      Customer.count({ where: { sms_consent: true } }) // SMS 동의
    ]);

    const stats = {
      bookings: {
        total: bookingStats[0],
        pending: bookingStats[1],
        confirmed: bookingStats[2],
        completed: bookingStats[3],
        cancelled: bookingStats[4]
      },
      users: {
        total: userStats[0],
        admin: userStats[1],
        manager: userStats[2],
        customer: userStats[3],
        active: userStats[4]
      },
      customers: {
        total: customerStats[0],
        individual: customerStats[1],
        corporate: customerStats[2], // business를 corporate로 매핑
        marketingConsent: customerStats[3],
        smsConsent: customerStats[4]
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('대시보드 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '대시보드 통계를 불러오는 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router; 