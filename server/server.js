// 프로덕션 환경에서는 Docker Compose에서 환경 변수를 로드
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: '../.env' });
}

// 출력 버퍼링 비활성화
process.stdout.setDefaultEncoding('utf8');
process.stderr.setDefaultEncoding('utf8');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { sequelize } = require('./models');
const logger = require('./utils/logger');
const { generalLimiter } = require('./middleware/rateLimiter');
const { getCSRFToken } = require('./middleware/csrf');

const app = express();
const PORT = process.env.PORT || 3001;

// Nginx와 같은 리버스 프록시 뒤에서 실행될 때를 대비
// 클라이언트의 실제 IP 주소를 Rate Limiter가 인식하도록 함
app.set('trust proxy', 1); // 1은 첫 번째 프록시를 신뢰한다는 의미

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'MissionClean API',
    version: '1.0.0',
    description: 'API documentation for Mission Clean aircon cleaning service backend',
  },
  servers: [
    { 
      url: process.env.NODE_ENV === 'production' 
        ? `https://${process.env.DOMAIN || 'aircleankorea.com'}`
        : `http://localhost:${PORT}` 
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  security: [{ bearerAuth: [] }],
};
const swaggerSpec = swaggerJsdoc({ swaggerDefinition, apis: ['./routes/*.js'] });

// 보안 헤더 설정 (Helmet 사용)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: process.env.NODE_ENV === 'production' ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  } : false
}));

// 세션 설정 (CSRF 토큰용)
app.use(session({
  secret: process.env.SESSION_SECRET || 'mission-clean-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24시간
  }
}));

// Rate Limiting 적용
app.use(generalLimiter);

// CORS 설정
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://aircleankorea.com', 'https://www.aircleankorea.com']
    : true,
  credentials: true
};
app.use(cors(corsOptions));

// API 문서는 개발환경에서만 활성화 또는 환경변수로 제어
if (process.env.NODE_ENV !== 'production' || process.env.SWAGGER_ENABLED === 'true') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CSRF 토큰 엔드포인트
app.get('/api/csrf-token', getCSRFToken);

// 보안 연락처 정보 API
const { getSafeContactForClient } = require('./utils/phoneProtection');
app.get('/api/contact-info', (req, res) => {
  res.json({
    success: true,
    data: getSafeContactForClient()
  });
});

// 보안 연락처 API (전화번호 마스킹)
const phoneProtection = require('./utils/phoneProtection');

app.get('/api/secure-contact', (req, res) => {
  try {
    const userRole = req.user?.role || 'guest'; // JWT에서 사용자 역할 추출
    const contactInfo = phoneProtection.getSafeContactForClient(userRole);
    
    res.json({
      success: true,
      data: contactInfo
    });
  } catch (error) {
    console.error('전화번호 마스킹 API 오류:', error);
    res.status(500).json({
      success: false,
      error: '연락처 정보를 가져오는데 실패했습니다.'
    });
  }
});

// API Routes (Rate Limiting 적용)
const { authLimiter, bookingLimiter } = require('./middleware/rateLimiter');

app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/bookings', bookingLimiter, require('./routes/bookingRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/aircon-specs', require('./routes/airconSpecRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// CAPTCHA API 엔드포인트 추가
const captchaUtils = require('./utils/captcha');

// CAPTCHA 생성 API
app.get('/api/captcha/generate', (req, res) => {
  try {
    const type = req.query.type || 'math'; // math 또는 korean
    
    let captcha;
    if (type === 'korean') {
      captcha = captchaUtils.generateKoreanCaptcha();
    } else {
      captcha = captchaUtils.generateMathCaptcha();
    }
    
    // 세션에 정답 저장 (보안상 클라이언트에는 전송하지 않음)
    req.session.captcha = {
      id: captcha.id,
      answer: captcha.answer,
      type: type,
      timestamp: Date.now()
    };
    
    res.json({
      success: true,
      data: {
        id: captcha.id,
        question: captcha.question,
        type: type
      }
    });
  } catch (error) {
    console.error('CAPTCHA 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: 'CAPTCHA 생성에 실패했습니다.'
    });
  }
});

// CAPTCHA 검증 API
app.post('/api/captcha/verify', (req, res) => {
  try {
    const { id, answer } = req.body;
    
    if (!req.session.captcha) {
      return res.status(400).json({
        success: false,
        error: 'CAPTCHA 세션이 없습니다. 새로 생성해주세요.'
      });
    }
    
    const { id: sessionId, answer: correctAnswer, type, timestamp } = req.session.captcha;
    
    // CAPTCHA 만료 검사 (5분)
    if (Date.now() - timestamp > 5 * 60 * 1000) {
      delete req.session.captcha;
      return res.status(400).json({
        success: false,
        error: 'CAPTCHA가 만료되었습니다. 새로 생성해주세요.'
      });
    }
    
    // ID 검증
    if (id !== sessionId) {
      return res.status(400).json({
        success: false,
        error: '잘못된 CAPTCHA ID입니다.'
      });
    }
    
    // 답안 검증
    let isValid = false;
    if (type === 'korean') {
      isValid = captchaUtils.verifyKoreanCaptcha(answer, correctAnswer);
    } else {
      isValid = captchaUtils.verifyCaptcha(answer, correctAnswer);
    }
    
    if (isValid) {
      // 검증 성공 시 세션에 검증 상태 저장
      req.session.captchaVerified = {
        timestamp: Date.now(),
        id: sessionId
      };
      delete req.session.captcha; // 사용된 CAPTCHA 삭제
      
      res.json({
        success: true,
        message: 'CAPTCHA 검증이 완료되었습니다.'
      });
    } else {
      res.status(400).json({
        success: false,
        error: '잘못된 답안입니다. 다시 시도해주세요.'
      });
    }
  } catch (error) {
    console.error('CAPTCHA 검증 오류:', error);
    res.status(500).json({
      success: false,
      error: 'CAPTCHA 검증에 실패했습니다.'
    });
  }
});

// SMS 문의 API 엔드포인트 추가
const smsService = require('./utils/smsService');
const { smsInquiryLimiter } = require('./middleware/rateLimiter');

app.post('/api/sms/inquiry', smsInquiryLimiter, async (req, res) => {
  try {
    const { name, phone, serviceType, message, privacyConsent } = req.body;
    
    // 개인정보 동의 확인
    if (privacyConsent !== true) {
      return res.status(400).json({
        success: false,
        error: '개인정보 수집·이용에 동의해주세요.'
      });
    }
    
    // 입력값 검증
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        error: '이름과 연락처는 필수 입력 항목입니다.'
      });
    }

    // 이름 길이 검증 (2-20자)
    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: '유효한 이름을 입력해주세요.'
      });
    } else if (name.length > 20) {
      return res.status(400).json({
        success: false,
        error: '이름은 20자 이하로 입력해주세요.'
      });
    }

    // 전화번호 형식 및 길이 검증
    const phonePattern = /^010[-]?\d{4}[-]?\d{4}$/;
    if (!phonePattern.test(phone.trim())) {
      return res.status(400).json({
        success: false,
        error: '올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)'
      });
    } else if (phone.length > 20) {
      return res.status(400).json({
        success: false,
        error: '연락처는 20자 이하로 입력해주세요.'
      });
    }

    // 메시지 길이 검증 (140자 제한)
    if (message && message.length > 140) {
      return res.status(400).json({
        success: false,
        error: '문의 내용은 140자 이하로 입력해주세요.'
      });
    }

    // 전화번호를 표준 형식으로 변환
    const formattedPhone = phone.trim().replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    
    // 고객에게 전송할 메시지 작성
    const customerMessage = `[Mission Clean] 문의 접수 완료
안녕하세요 ${name}님!

문의해주셔서 감사합니다.
${serviceType ? `관심 서비스: ${serviceType}` : '일반 상담 문의'}

담당자가 확인 후 1시간 내에 연락드리겠습니다.

🎯 7월 특가 혜택
- 모든 서비스 20% 할인
- 대전 중구 추가 10% 할인

Mission Clean 드림`;

    // 관리자에게 전송할 알림 메시지 작성
    const adminMessage = `[Mission Clean] 새 SMS 문의
📝 고객명: ${name}
📞 연락처: ${formattedPhone}
🛠️ 서비스: ${serviceType || '미선택'}
💬 문의: ${message || '없음'}

즉시 고객에게 연락해주세요!`;

    // 고객에게 SMS 전송
    try {
      await smsService.sendCustomMessage(formattedPhone, customerMessage);
      logger.info('SMS 문의 고객 알림 전송 완료', { 
        customerPhone: formattedPhone, 
        name: name 
      });
    } catch (smsError) {
      logger.warn('SMS 문의 고객 알림 전송 실패', { 
        customerPhone: formattedPhone, 
        error: smsError.message 
      });
    }

    // 관리자에게 SMS 알림
    try {
      const adminPhone = process.env.TECHNICIAN_PHONE || '010-9171-8465';
      await smsService.sendCustomMessage(adminPhone, adminMessage);
      logger.info('SMS 문의 관리자 알림 전송 완료', { 
        adminPhone: adminPhone 
      });
    } catch (smsError) {
      logger.warn('SMS 문의 관리자 알림 전송 실패', { 
        error: smsError.message 
      });
    }

    res.json({
      success: true,
      message: 'SMS 문의가 접수되었습니다. 1시간 내에 연락드리겠습니다.'
    });

  } catch (error) {
    logger.error('SMS 문의 처리 중 오류', { 
      error: error.message, 
      requestBody: req.body 
    });
    res.status(500).json({
      success: false,
      error: 'SMS 문의 처리 중 오류가 발생했습니다.'
    });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ status: 'OK', message: 'Database connection is healthy.' });
  } catch (error) {
    logger.error('Health check failed: Database connection error.', { error: error.message });
    res.status(503).json({ status: 'error', message: 'Service Unavailable (DB)' });
  }
});

// API Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ status: 'OK', message: 'API and Database connection is healthy.' });
  } catch (error) {
    logger.error('API Health check failed: Database connection error.', { error: error.message });
    res.status(503).json({ status: 'error', message: 'Service Unavailable (DB)' });
  }
});

// 404 에러 핸들링
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Not Found' });
});

// 글로벌 에러 핸들링
app.use((error, req, res, next) => {
  logger.error('Unhandled Error', { error: error.message, stack: error.stack, path: req.path });
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

const main = async () => {
  try {
    logger.system('Mission Clean API 서버를 시작합니다...');
    
    // 데이터베이스 연결 재시도 로직
    let retries = 5;
    while (retries > 0) {
      try {
        logger.info(`데이터베이스 연결 시도 중... (남은 시도: ${retries})`);
        await sequelize.authenticate();
        logger.info('데이터베이스 연결 성공!');
        break;
      } catch (error) {
        retries--;
        logger.error(`데이터베이스 연결 실패: ${error.message}`);
        if (retries === 0) {
          logger.error('데이터베이스 연결 최대 재시도 횟수 초과');
          throw error;
        }
        logger.info('5초 후 재시도...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    await sequelize.sync({ alter: true });
    logger.info('데이터베이스 동기화 완료.');

    if (process.env.NODE_ENV === 'production') {
      const { runSeeders } = require('./seeders');
      await runSeeders();
    }

    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.system(`서버가 포트 ${PORT}에서 성공적으로 시작되었습니다.`);
      logger.info(`헬스체크: http://localhost:${PORT}/health`);
    });

    const gracefulShutdown = (signal) => {
      logger.system(`${signal} 수신. 서버를 안전하게 종료합니다.`);
      server.close(() => {
        logger.system('HTTP 서버가 닫혔습니다.');
        sequelize.close().then(() => {
          logger.info('DB 연결이 닫혔습니다.');
          process.exit(0);
        });
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('서버 시작 실패.', { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

process.on('uncaughtException', (error) => {
  logger.error('처리되지 않은 예외', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('처리되지 않은 Promise 거부', { reason: reason?.toString() });
  process.exit(1);
});

main();