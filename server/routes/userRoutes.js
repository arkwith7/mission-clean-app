const express = require('express');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User } = require('../models');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// 모든 사용자 목록 조회 (관리자만)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '', status = '' } = req.query;
    const offset = (page - 1) * limit;

    // 검색 조건 구성
    const whereConditions = {};
    
    if (search) {
      whereConditions[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (role) {
      whereConditions.role = role;
    }
    
    if (status) {
      whereConditions.status = status;
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereConditions,
      attributes: { exclude: ['password_hash'] }, // 비밀번호 제외
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('사용자 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '사용자 목록을 불러오는 중 오류가 발생했습니다.'
    });
  }
});

// 특정 사용자 조회 (관리자만)
router.get('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password_hash'] },
      include: [
        {
          association: 'customers',
          required: false
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('사용자 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '사용자 정보를 불러오는 중 오류가 발생했습니다.'
    });
  }
});

// 새 사용자 생성 (관리자만)
router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { username, email, password, role = 'customer', status = 'active' } = req.body;

    // 입력값 검증
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: '사용자명, 이메일, 비밀번호는 필수 입력 항목입니다.'
      });
    }

    // 중복 확인
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: '이미 사용 중인 사용자명 또는 이메일입니다.'
      });
    }

    // 비밀번호 해싱
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // 사용자 생성
    const user = await User.create({
      username,
      email,
      password_hash,
      role,
      status
    });

    // 응답에서 비밀번호 제외
    const userResponse = user.toJSON();
    delete userResponse.password_hash;

    res.status(201).json({
      success: true,
      message: '사용자가 성공적으로 생성되었습니다.',
      data: { user: userResponse }
    });
  } catch (error) {
    console.error('사용자 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: '사용자 생성 중 오류가 발생했습니다.'
    });
  }
});

// 사용자 정보 수정 (관리자만)
router.put('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, status, password } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.'
      });
    }

    // 업데이트할 데이터 준비
    const updateData = {};
    
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    
    // 비밀번호 변경 시
    if (password) {
      const saltRounds = 12;
      updateData.password_hash = await bcrypt.hash(password, saltRounds);
    }

    // 중복 확인 (현재 사용자 제외)
    if (username || email) {
      const whereConditions = {
        user_id: { [Op.ne]: id }
      };
      
      if (username || email) {
        whereConditions[Op.or] = [];
        if (username) whereConditions[Op.or].push({ username });
        if (email) whereConditions[Op.or].push({ email });
      }

      const existingUser = await User.findOne({ where: whereConditions });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: '이미 사용 중인 사용자명 또는 이메일입니다.'
        });
      }
    }

    // 업데이트 실행
    await user.update(updateData);
    
    // 응답에서 비밀번호 제외
    const userResponse = user.toJSON();
    delete userResponse.password_hash;

    res.json({
      success: true,
      message: '사용자 정보가 성공적으로 수정되었습니다.',
      data: { user: userResponse }
    });
  } catch (error) {
    console.error('사용자 수정 오류:', error);
    res.status(500).json({
      success: false,
      error: '사용자 정보 수정 중 오류가 발생했습니다.'
    });
  }
});

// 사용자 삭제 (관리자만)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // 현재 로그인한 사용자가 자기 자신을 삭제하려는 것 방지
    if (parseInt(id) === req.user.userId) {
      return res.status(400).json({
        success: false,
        error: '자기 자신의 계정은 삭제할 수 없습니다.'
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.'
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: '사용자가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('사용자 삭제 오류:', error);
    res.status(500).json({
      success: false,
      error: '사용자 삭제 중 오류가 발생했습니다.'
    });
  }
});

// 사용자 상태 변경 (관리자만)
router.patch('/:id/status', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 상태입니다.'
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.'
      });
    }

    await user.update({ status });

    res.json({
      success: true,
      message: `사용자 상태가 '${status}'로 변경되었습니다.`,
      data: { user: { id: user.user_id, status: user.status } }
    });
  } catch (error) {
    console.error('사용자 상태 변경 오류:', error);
    res.status(500).json({
      success: false,
      error: '사용자 상태 변경 중 오류가 발생했습니다.'
    });
  }
});

// 사용자 통계 조회 (관리자만)
router.get('/stats/overview', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    // 전체 사용자 수
    const totalUsers = await User.count();
    
    // 역할별 사용자 수
    const adminUsers = await User.count({ where: { role: 'admin' } });
    const managerUsers = await User.count({ where: { role: 'manager' } });
    const customerUsers = await User.count({ where: { role: 'customer' } });
    
    // 활성 사용자 수
    const activeUsers = await User.count({ where: { status: 'active' } });

    console.log('사용자 통계 조회:', {
      total: totalUsers,
      admin: adminUsers,
      manager: managerUsers,
      customer: customerUsers,
      active: activeUsers
    });

    res.json({
      success: true,
      data: {
        overview: {
          total: totalUsers,
          admin: adminUsers,
          manager: managerUsers,
          customer: customerUsers,
          active: activeUsers
        }
      }
    });
  } catch (error) {
    console.error('사용자 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '사용자 통계를 불러오는 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router; 