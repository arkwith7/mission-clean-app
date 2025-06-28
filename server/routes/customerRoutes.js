const express = require('express');
const { Op } = require('sequelize');
const { Customer, User, Booking, sequelize } = require('../models');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// 모든 고객 목록 조회 (관리자만)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', customer_type = '', age_group = '', registration_source = '' } = req.query;
    const offset = (page - 1) * limit;

    // 검색 조건 구성
    const whereConditions = {};
    
    if (search) {
      whereConditions[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (customer_type) {
      whereConditions.customer_type = customer_type;
    }
    
    if (age_group) {
      whereConditions.age_group = age_group;
    }
    
    if (registration_source) {
      whereConditions.registration_source = registration_source;
    }

    const { count, rows: customers } = await Customer.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'username', 'email', 'role', 'status'],
          required: false
        },
        {
          model: Booking,
          as: 'bookings',
          attributes: ['booking_id', 'status', 'created_at'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // 각 고객의 예약 통계 계산
    const customersWithStats = customers.map(customer => {
      const customerData = customer.toJSON();
      customerData.bookingCount = customer.bookings ? customer.bookings.length : 0;
      customerData.lastBookingDate = customer.bookings && customer.bookings.length > 0 
        ? customer.bookings[customer.bookings.length - 1].created_at 
        : null;
      return customerData;
    });

    res.json({
      success: true,
      data: {
        customers: customersWithStats,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('고객 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '고객 목록을 불러오는 중 오류가 발생했습니다.'
    });
  }
});

// 특정 고객 조회 (관리자만)
router.get('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = await Customer.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'username', 'email', 'role', 'status']
        },
        {
          model: Booking,
          as: 'bookings',
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: '고객을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: { customer }
    });
  } catch (error) {
    console.error('고객 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '고객 정보를 불러오는 중 오류가 발생했습니다.'
    });
  }
});

// 새 고객 생성 (관리자만)
router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const {
      user_id,
      name,
      phone,
      email,
      address,
      detailed_address,
      age_group,
      gender,
      customer_type = 'individual',
      registration_source = 'website',
      marketing_consent = false,
      sms_consent = false
    } = req.body;

    // 필수 입력값 검증
    if (!name || !phone || !address) {
      return res.status(400).json({
        success: false,
        error: '이름, 전화번호, 주소는 필수 입력 항목입니다.'
      });
    }

    // 전화번호 중복 확인
    const existingCustomer = await Customer.findOne({
      where: { phone }
    });

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        error: '이미 등록된 전화번호입니다.'
      });
    }

    // user_id가 제공된 경우 유효성 확인
    if (user_id) {
      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(400).json({
          success: false,
          error: '유효하지 않은 사용자 ID입니다.'
        });
      }
    }

    // 고객 생성
    const customer = await Customer.create({
      user_id: user_id || null,
      name,
      phone,
      email,
      address,
      detailed_address,
      age_group,
      gender,
      customer_type,
      registration_source,
      marketing_consent,
      sms_consent
    });

    res.status(201).json({
      success: true,
      message: '고객이 성공적으로 등록되었습니다.',
      data: { customer }
    });
  } catch (error) {
    console.error('고객 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: '고객 등록 중 오류가 발생했습니다.'
    });
  }
});

// 고객 정보 수정 (관리자만)
router.put('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: '고객을 찾을 수 없습니다.'
      });
    }

    // 전화번호 중복 확인 (현재 고객 제외)
    if (updateData.phone) {
      const existingCustomer = await Customer.findOne({
        where: {
          phone: updateData.phone,
          customer_id: { [Op.ne]: id }
        }
      });

      if (existingCustomer) {
        return res.status(400).json({
          success: false,
          error: '이미 사용 중인 전화번호입니다.'
        });
      }
    }

    // user_id가 제공된 경우 유효성 확인
    if (updateData.user_id) {
      const user = await User.findByPk(updateData.user_id);
      if (!user) {
        return res.status(400).json({
          success: false,
          error: '유효하지 않은 사용자 ID입니다.'
        });
      }
    }

    // 업데이트 실행
    await customer.update(updateData);
    
    // 업데이트된 고객 정보 조회
    const updatedCustomer = await Customer.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'username', 'email', 'role', 'status']
        }
      ]
    });

    res.json({
      success: true,
      message: '고객 정보가 성공적으로 수정되었습니다.',
      data: { customer: updatedCustomer }
    });
  } catch (error) {
    console.error('고객 수정 오류:', error);
    res.status(500).json({
      success: false,
      error: '고객 정보 수정 중 오류가 발생했습니다.'
    });
  }
});

// 고객 삭제 (관리자만)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: '고객을 찾을 수 없습니다.'
      });
    }

    // 예약이 있는 고객인지 확인
    const bookingCount = await Booking.count({
      where: { customer_id: id }
    });

    if (bookingCount > 0) {
      return res.status(400).json({
        success: false,
        error: '예약 내역이 있는 고객은 삭제할 수 없습니다. 대신 비활성화를 고려해주세요.'
      });
    }

    await customer.destroy();

    res.json({
      success: true,
      message: '고객이 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('고객 삭제 오류:', error);
    res.status(500).json({
      success: false,
      error: '고객 삭제 중 오류가 발생했습니다.'
    });
  }
});

// 고객 통계 조회 (관리자만)
router.get('/stats/overview', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const totalCustomers = await Customer.count();
    const individualCustomers = await Customer.count({ where: { customer_type: 'individual' } });
    const businessCustomers = await Customer.count({ where: { customer_type: 'business' } });
    
    const marketingConsentCount = await Customer.count({ where: { marketing_consent: true } });
    const smsConsentCount = await Customer.count({ where: { sms_consent: true } });

    // 월별 신규 고객 (최근 6개월)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyNewCustomers = await Customer.findAll({
      where: {
        created_at: { [Op.gte]: sixMonthsAgo }
      },
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'month'],
        [sequelize.fn('COUNT', sequelize.col('customer_id')), 'count']
      ],
      group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'ASC']]
    });

    res.json({
      success: true,
      data: {
        overview: {
          total: totalCustomers,
          individual: individualCustomers,
          business: businessCustomers,
          marketingConsent: marketingConsentCount,
          smsConsent: smsConsentCount
        },
        monthlyNewCustomers
      }
    });
  } catch (error) {
    console.error('고객 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '고객 통계를 불러오는 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;
