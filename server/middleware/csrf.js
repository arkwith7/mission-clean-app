const crypto = require('crypto');
const logger = require('../utils/logger');

// CSRF 토큰 생성
const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// CSRF 토큰 검증 미들웨어
const csrfProtection = (req, res, next) => {
  // GET 요청은 CSRF 검증 제외
  if (req.method === 'GET') {
    return next();
  }

  // API 인증이 필요한 요청은 JWT로 보호되므로 CSRF 제외
  if (req.headers.authorization) {
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    logger.warn('CSRF token validation failed', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
      hasToken: !!token,
      hasSessionToken: !!sessionToken
    });

    return res.status(403).json({
      success: false,
      error: 'CSRF 토큰이 유효하지 않습니다.'
    });
  }

  next();
};

// CSRF 토큰 제공 엔드포인트
const getCSRFToken = (req, res) => {
  const token = generateCSRFToken();
  req.session.csrfToken = token;
  
  res.json({
    success: true,
    data: { csrfToken: token }
  });
};

module.exports = {
  csrfProtection,
  getCSRFToken,
  generateCSRFToken
}; 