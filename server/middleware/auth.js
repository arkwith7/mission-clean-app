const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

// JWT 시크릿 키 유효성 검사
if (!process.env.JWT_SECRET) {
  logger.error('JWT_SECRET 환경 변수가 설정되지 않았습니다. 서버를 시작할 수 없습니다.');
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  logger.warn('JWT_SECRET이 너무 짧습니다. 보안을 위해 최소 32자 이상 사용하는 것을 권장합니다.');
}

// JWT 토큰 생성
const generateToken = (userId) => {
  try {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  } catch (error) {
    logger.error('JWT 토큰 생성 중 오류', { error: error.message, userId });
    throw new Error('토큰 생성에 실패했습니다.');
  }
};

// JWT 토큰 검증 미들웨어
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: '액세스 토큰이 필요합니다.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      logger.warn('유효하지 않은 토큰으로 접근 시도', { userId: decoded.userId });
      return res.status(401).json({ 
        success: false, 
        error: '유효하지 않은 토큰입니다.' 
      });
    }

    if (user.status !== 'active') {
      logger.warn('비활성화된 계정으로 접근 시도', { userId: user.user_id, status: user.status });
      return res.status(401).json({ 
        success: false, 
        error: '비활성화된 계정입니다.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      logger.warn('유효하지 않은 JWT 토큰', { error: error.message });
      return res.status(401).json({ 
        success: false, 
        error: '유효하지 않은 토큰입니다.' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      logger.warn('만료된 JWT 토큰', { error: error.message });
      return res.status(401).json({ 
        success: false, 
        error: '토큰이 만료되었습니다.' 
      });
    }
    logger.error('토큰 검증 중 예상치 못한 오류', { error: error.message });
    return res.status(500).json({ 
      success: false, 
      error: '토큰 검증 중 오류가 발생했습니다.' 
    });
  }
};

// 관리자 권한 확인 미들웨어
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    logger.error('requireAdmin: 사용자 정보가 없습니다.');
    return res.status(401).json({ 
      success: false, 
      error: '인증이 필요합니다.' 
    });
  }

  if (req.user.role !== 'admin') {
    logger.warn('관리자 권한 없는 접근 시도', { userId: req.user.user_id, role: req.user.role });
    return res.status(403).json({ 
      success: false, 
      error: '관리자 권한이 필요합니다.' 
    });
  }
  next();
};

// 매니저 이상 권한 확인 미들웨어
const requireManager = (req, res, next) => {
  if (!req.user) {
    logger.error('requireManager: 사용자 정보가 없습니다.');
    return res.status(401).json({ 
      success: false, 
      error: '인증이 필요합니다.' 
    });
  }

  if (!['admin', 'manager'].includes(req.user.role)) {
    logger.warn('매니저 권한 없는 접근 시도', { userId: req.user.user_id, role: req.user.role });
    return res.status(403).json({ 
      success: false, 
      error: '매니저 이상 권한이 필요합니다.' 
    });
  }
  next();
};

module.exports = {
  generateToken,
  authenticateToken,
  requireAdmin,
  requireManager
}; 