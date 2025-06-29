const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// 환경별 설정
const isProduction = process.env.NODE_ENV === 'production';

// 일반 API 제한
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: isProduction ? 100 : 1000, // 개발환경: 1000회, 프로덕션: 100회
  message: {
    success: false,
    error: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path
    });
    res.status(429).json({
      success: false,
      error: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
});

// 로그인 API 엄격한 제한
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: isProduction ? 5 : 50, // 개발환경: 50회, 프로덕션: 5회
  message: {
    success: false,
    error: '로그인 시도가 너무 많습니다. 15분 후 다시 시도해주세요.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // 성공한 요청은 카운트하지 않음
  handler: (req, res) => {
    logger.error('Login rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      email: req.body.email
    });
    res.status(429).json({
      success: false,
      error: '로그인 시도가 너무 많습니다. 15분 후 다시 시도해주세요.'
    });
  }
});

// 예약 API 제한
const bookingLimiter = rateLimit({
  windowMs: isProduction ? 60 * 60 * 1000 : 60 * 1000, // 개발환경: 1분, 프로덕션: 1시간
  max: isProduction ? 5 : 100, // 개발환경: 100회, 프로덕션: 5회
  message: {
    success: false,
    error: '예약 신청이 너무 많습니다. 1시간 후 다시 시도해주세요.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Booking rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      phone: req.body.phone
    });
    res.status(429).json({
      success: false,
      error: '예약 신청이 너무 많습니다. 1시간 후 다시 시도해주세요.'
    });
  }
});

// SMS 문의 API 제한
const smsInquiryLimiter = rateLimit({
  windowMs: isProduction ? 30 * 60 * 1000 : 60 * 1000, // 개발환경: 1분, 프로덕션: 30분
  max: isProduction ? 5 : 50, // 개발환경: 50회, 프로덕션: 5회
  message: {
    success: false,
    error: 'SMS 문의가 너무 많습니다. 30분 후 다시 시도해주세요.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('SMS inquiry rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      phone: req.body.phone
    });
    res.status(429).json({
      success: false,
      error: 'SMS 문의가 너무 많습니다. 30분 후 다시 시도해주세요.'
    });
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  bookingLimiter,
  smsInquiryLimiter
}; 