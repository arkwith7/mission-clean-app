# Mission Clean App 보안 구현 가이드

**작성일**: 2025년 6월 28일  
**버전**: v2.0  
**대상**: 개발자 및 시스템 관리자

## 📋 목차

1. [CAPTCHA 구현 가이드](#captcha-구현-가이드)
2. [Rate Limiting 구현 가이드](#rate-limiting-구현-가이드)
3. [입력값 검증 구현 가이드](#입력값-검증-구현-가이드)
4. [세션 보안 구현 가이드](#세션-보안-구현-가이드)
5. [로깅 시스템 구현 가이드](#로깅-시스템-구현-가이드)

---

## 🔐 CAPTCHA 구현 가이드

### 1. 클라이언트 측 CAPTCHA 유틸리티

**파일**: `client/src/utils/captcha.ts`

```typescript
export interface CaptchaChallenge {
  question: string;
  answer: number;
}

export const generateMathCaptcha = (): CaptchaChallenge => {
  const num1 = Math.floor(Math.random() * 20) + 1;
  const num2 = Math.floor(Math.random() * 20) + 1;
  const operators = ['+', '-', '*'];
  const operator = operators[Math.floor(Math.random() * operators.length)];
  
  let answer: number;
  let question: string;
  
  switch (operator) {
    case '+':
      answer = num1 + num2;
      question = `${num1} + ${num2} = ?`;
      break;
    case '-':
      const max = Math.max(num1, num2);
      const min = Math.min(num1, num2);
      answer = max - min;
      question = `${max} - ${min} = ?`;
      break;
    case '*':
      const smallNum1 = Math.floor(Math.random() * 10) + 1;
      const smallNum2 = Math.floor(Math.random() * 10) + 1;
      answer = smallNum1 * smallNum2;
      question = `${smallNum1} × ${smallNum2} = ?`;
      break;
    default:
      answer = num1 + num2;
      question = `${num1} + ${num2} = ?`;
  }
  
  return { question, answer };
};

export const verifyCaptcha = (userAnswer: string, correctAnswer: number): boolean => {
  const numericAnswer = parseInt(userAnswer.trim());
  return !isNaN(numericAnswer) && numericAnswer === correctAnswer;
};
```

### 2. 서버 측 CAPTCHA 검증

**파일**: `server/server.js`

```javascript
// CAPTCHA 검증 엔드포인트
app.post('/api/auth/verify-captcha', (req, res) => {
  try {
    const { answer } = req.body;
    
    if (!req.session.captcha) {
      return res.status(400).json({
        success: false,
        error: 'CAPTCHA 세션이 만료되었습니다.'
      });
    }
    
    const userAnswer = parseInt(answer);
    if (isNaN(userAnswer) || userAnswer !== req.session.captcha.answer) {
      req.session.captchaVerified = false;
      return res.status(400).json({
        success: false,
        error: '잘못된 답안입니다.'
      });
    }
    
    req.session.captchaVerified = true;
    req.session.captchaVerifiedAt = Date.now();
    
    res.json({ success: true, message: 'CAPTCHA 검증 완료' });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'CAPTCHA 검증에 실패했습니다.'
    });
  }
});

// CAPTCHA 생성 엔드포인트
app.get('/api/auth/captcha', (req, res) => {
  try {
    // 간단한 수학 문제 생성
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let answer, question;
    
    switch (operator) {
      case '+':
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
        break;
      case '-':
        const max = Math.max(num1, num2);
        const min = Math.min(num1, num2);
        answer = max - min;
        question = `${max} - ${min}`;
        break;
      case '*':
        const smallNum1 = Math.floor(Math.random() * 10) + 1;
        const smallNum2 = Math.floor(Math.random() * 10) + 1;
        answer = smallNum1 * smallNum2;
        question = `${smallNum1} × ${smallNum2}`;
        break;
    }
    
    // 세션에 CAPTCHA 정보 저장
    req.session.captcha = { question, answer };
    req.session.captchaVerified = false;
    
    res.json({
      success: true,
      question: question,
      // 보안을 위해 답안은 전송하지 않음
    });
    
  } catch (error) {
    logger.error('CAPTCHA 생성 중 오류', {
      error: error.message,
      ip: req.ip
    });
    
    res.status(500).json({
      success: false,
      error: 'CAPTCHA 생성에 실패했습니다.'
    });
  }
});
```

### 3. React 컴포넌트에서 CAPTCHA 사용

```typescript
// ContactSection.tsx 예시
const [captcha, setCaptcha] = useState<CaptchaChallenge | null>(null);
const [captchaAnswer, setCaptchaAnswer] = useState('');
const [captchaError, setCaptchaError] = useState('');

// CAPTCHA 생성
useEffect(() => {
  setCaptcha(generateMathCaptcha());
}, []);

// CAPTCHA 새로고침
const handleCaptchaRefresh = () => {
  setCaptcha(generateMathCaptcha());
  setCaptchaAnswer('');
  setCaptchaError('');
};

// 폼 제출 시 CAPTCHA 검증
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // 클라이언트 측 CAPTCHA 검증
  if (!captcha || !verifyCaptcha(captchaAnswer, captcha.answer as number)) {
    setCaptchaError('보안 문자를 다시 확인해주세요.');
    return;
  }
  
  // 서버로 데이터 전송
  // ...
};
```

---

## 🚦 Rate Limiting 구현 가이드

### 1. Rate Limiter 미들웨어 설정

**파일**: `server/middleware/rateLimiter.js`

```javascript
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// 인증 관련 Rate Limiting (15분 5회)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', { ip: req.ip });
    res.status(429).json({
      success: false,
      error: '인증 시도가 너무 많습니다. 15분 후 다시 시도해주세요.'
    });
  }
});

// 예약 관련 Rate Limiting (10분 3회)
const bookingLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  handler: (req, res) => {
    logger.warn('Booking rate limit exceeded', { ip: req.ip });
    res.status(429).json({
      success: false,
      error: '예약 시도가 너무 많습니다. 10분 후 다시 시도해주세요.'
    });
  }
});

// SMS 문의 Rate Limiting (30분 2회)
const smsInquiryLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 2,
  handler: (req, res) => {
    logger.warn('SMS inquiry rate limit exceeded', { ip: req.ip });
    res.status(429).json({
      success: false,
      error: 'SMS 문의가 너무 많습니다. 30분 후 다시 시도해주세요.'
    });
  }
});

module.exports = { authLimiter, bookingLimiter, smsInquiryLimiter };
```

### 2. Rate Limiter 적용

**파일**: `server/server.js`

```javascript
const { authLimiter, bookingLimiter, smsInquiryLimiter } = require('./middleware/rateLimiter');

// 전역 Rate Limiting 적용
app.use('/api/', generalLimiter);

// 특정 엔드포인트에 Rate Limiting 적용
app.use('/api/auth', authLimiter);
app.use('/api/bookings', bookingLimiter);
app.post('/api/sms/inquiry', smsInquiryLimiter, async (req, res) => {
  // SMS 문의 처리 로직
});
```

---

## ✅ 입력값 검증 구현 가이드

### 1. 프론트엔드 입력값 검증

**파일**: `client/src/components/ContactSection.tsx`

```typescript
// 실시간 글자 수 카운터와 함께 입력 필드 구현
const renderInputField = (
  name: string,
  value: string,
  maxLength: number,
  placeholder: string,
  required: boolean = false,
  type: string = 'text'
) => (
  <div className="relative">
    <input
      type={type}
      name={name}
      value={value}
      onChange={handleInputChange}
      maxLength={maxLength}
      required={required}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-16"
      placeholder={placeholder}
    />
    <div className="absolute top-1/2 right-2 transform -translate-y-1/2 text-xs text-gray-500 bg-white px-1 rounded">
      {value.length}/{maxLength}
    </div>
  </div>
);

// 사용 예시
{renderInputField('name', formData.name, 20, '홍길동', true)}
{renderInputField('phone', formData.phone, 20, '010-1234-5678', true, 'tel')}
```

### 2. 백엔드 입력값 검증

**파일**: `server/routes/bookingRoutes.js`

```javascript
const validator = require('validator');

// 입력값 검증 함수
const validateBookingInput = (data) => {
  const { name, phone, address, serviceType, message } = data;
  const errors = [];

  // 이름 검증 (2-20자)
  if (!name || name.trim().length < 2) {
    errors.push('유효한 이름을 입력해주세요.');
  } else if (name.length > 20) {
    errors.push('이름은 20자 이하로 입력해주세요.');
  }

  // 전화번호 검증 (형식 + 20자 제한)
  const phonePattern = /^010[-]?\d{4}[-]?\d{4}$/;
  if (!phone || !phonePattern.test(phone.trim())) {
    errors.push('올바른 전화번호 형식을 입력해주세요.');
  } else if (phone.length > 20) {
    errors.push('연락처는 20자 이하로 입력해주세요.');
  }

  // 주소 검증 (5-60자)
  if (!address || address.trim().length < 5) {
    errors.push('상세한 주소를 입력해주세요.');
  } else if (address.length > 60) {
    errors.push('서비스 주소는 60자 이하로 입력해주세요.');
  }

  // 서비스 타입 검증
  const validTypes = ['벽걸이형', '스탠드형', '시스템1way', '시스템4way', '실외기', '2대이상'];
  if (!serviceType || !validTypes.includes(serviceType)) {
    errors.push('올바른 서비스 종류를 선택해주세요.');
  }

  // 메시지 길이 검증 (140자 제한)
  if (message && message.length > 140) {
    errors.push('추가 요청사항은 140자 이하로 입력해주세요.');
  }

  return errors;
};

// 입력값 살균 처리
const sanitizeInput = (data) => {
  return {
    name: data.name ? data.name.trim().replace(/\s+/g, ' ') : '',
    phone: data.phone ? data.phone.replace(/[-\s]/g, '').replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3') : '',
    address: data.address ? data.address.trim() : '',
    serviceType: data.serviceType || '',
    message: data.message ? data.message.trim() : '',
    preferredDate: data.preferredDate || null,
    preferredTime: data.preferredTime || null
  };
};

// 라우터에서 사용
router.post('/', async (req, res) => {
  try {
    // 입력값 살균 처리
    const sanitizedData = sanitizeInput(req.body);
    
    // 입력값 검증
    const validationErrors = validateBookingInput(sanitizedData);
    if (validationErrors.length > 0) {
      logger.warn('예약 신청 입력값 검증 실패', {
        errors: validationErrors,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });
      
      return res.status(400).json({
        success: false,
        error: validationErrors.join(' '),
        errors: validationErrors
      });
    }

    // CAPTCHA 검증
    if (!req.session.captchaVerified) {
      return res.status(400).json({
        success: false,
        error: '보안 인증이 필요합니다. CAPTCHA를 먼저 완료해주세요.'
      });
    }

    // 예약 처리 로직...
    
  } catch (error) {
    logger.error('예약 처리 중 오류', {
      error: error.message,
      stack: error.stack,
      requestBody: req.body
    });
    
    res.status(500).json({
      success: false,
      error: '예약 처리 중 오류가 발생했습니다.'
    });
  }
});
```

---

## 🔑 세션 보안 구현 가이드

### 1. 세션 설정

**파일**: `server/server.js`

```javascript
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

// 세션 스토어 설정 (데이터베이스 기반)
const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: 'sessions',
  checkExpirationInterval: 15 * 60 * 1000, // 15분마다 만료된 세션 정리
  expiration: 24 * 60 * 60 * 1000 // 24시간
});

// 세션 미들웨어 설정
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  name: 'mission-clean-session', // 기본 세션 쿠키 이름 변경
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS에서만 전송
    httpOnly: true, // JavaScript에서 접근 불가
    maxAge: 24 * 60 * 60 * 1000, // 24시간
    sameSite: 'strict' // CSRF 공격 방지
  },
  genid: () => {
    // 강력한 세션 ID 생성
    return require('crypto').randomBytes(32).toString('hex');
  }
}));

// 세션 스토어 동기화
sessionStore.sync();
```

### 2. 세션 기반 CAPTCHA 검증

```javascript
// CAPTCHA 상태 확인 미들웨어
const requireCaptchaVerification = (req, res, next) => {
  if (!req.session.captchaVerified) {
    logger.warn('CAPTCHA 검증되지 않은 요청', {
      ip: req.ip,
      path: req.path,
      timestamp: new Date().toISOString()
    });
    
    return res.status(400).json({
      success: false,
      error: '보안 인증이 필요합니다. CAPTCHA를 먼저 완료해주세요.'
    });
  }
  
  // CAPTCHA 검증 시간 확인 (5분 이내)
  const verificationAge = Date.now() - (req.session.captchaVerifiedAt || 0);
  if (verificationAge > 5 * 60 * 1000) {
    req.session.captchaVerified = false;
    delete req.session.captchaVerifiedAt;
    
    return res.status(400).json({
      success: false,
      error: 'CAPTCHA 검증이 만료되었습니다. 다시 검증해주세요.'
    });
  }
  
  next();
};

// 사용 예시
app.post('/api/bookings', requireCaptchaVerification, async (req, res) => {
  // 예약 처리 로직
});
```

---

## 📊 로깅 시스템 구현 가이드

### 1. Winston 로거 설정

**파일**: `server/utils/logger.js`

```javascript
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// 로그 디렉토리 생성
const fs = require('fs');
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// 커스텀 포맷 정의
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    // 메타데이터가 있으면 JSON으로 추가
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    return log;
  })
);

// 로거 생성
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: { service: 'mission-clean-api' },
  transports: [
    // 에러 로그 (매일 로테이션)
    new DailyRotateFile({
      level: 'error',
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      zippedArchive: true
    }),
    
    // 모든 로그 (매일 로테이션)
    new DailyRotateFile({
      filename: path.join(logDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true
    }),
    
    // 보안 관련 로그 (별도 파일)
    new DailyRotateFile({
      level: 'warn',
      filename: path.join(logDir, 'security-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '10m',
      maxFiles: '30d',
      zippedArchive: true,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ]
});

// 개발 환경에서는 콘솔 출력 추가
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// 민감 정보 마스킹 함수
const maskSensitiveData = (data) => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  const masked = { ...data };
  
  // 전화번호 마스킹
  if (masked.phone) {
    masked.phone = masked.phone.replace(/(\d{3})-(\d{4})-(\d{4})/, '$1-****-$3');
  }
  
  // 이름 마스킹 (첫 글자만 표시)
  if (masked.name && masked.name.length > 1) {
    masked.name = masked.name.charAt(0) + '*'.repeat(masked.name.length - 1);
  }
  
  // 주소 마스킹 (앞부분만 표시)
  if (masked.address && masked.address.length > 10) {
    masked.address = masked.address.substring(0, 10) + '****';
  }
  
  return masked;
};

// 보안 로깅 전용 함수들
logger.security = {
  rateLimitExceeded: (req, type) => {
    logger.warn('Rate limit exceeded', {
      type,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      timestamp: new Date().toISOString()
    });
  },
  
  captchaFailed: (req, expectedAnswer, userAnswer) => {
    logger.warn('CAPTCHA verification failed', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      expectedAnswer,
      userAnswer,
      timestamp: new Date().toISOString()
    });
  },
  
  suspiciousActivity: (req, reason) => {
    logger.warn('Suspicious activity detected', {
      reason,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      timestamp: new Date().toISOString()
    });
  }
};

// 시스템 로깅 함수
logger.system = (message, meta = {}) => {
  logger.info(`[SYSTEM] ${message}`, meta);
};

module.exports = { logger, maskSensitiveData };
```

### 2. 로깅 미들웨어

**파일**: `server/middleware/logging.js`

```javascript
const { logger, maskSensitiveData } = require('../utils/logger');

// 요청 로깅 미들웨어
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // 응답 완료 시 로깅
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    };
    
    // 민감한 정보가 포함된 요청은 마스킹 처리
    if (req.body && Object.keys(req.body).length > 0) {
      logData.body = maskSensitiveData(req.body);
    }
    
    if (res.statusCode >= 400) {
      logger.warn('HTTP Error', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });
  
  next();
};

// 에러 로깅 미들웨어
const errorLogger = (error, req, res, next) => {
  logger.error('Unhandled Error', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString(),
    body: req.body ? maskSensitiveData(req.body) : undefined
  });
  
  next(error);
};

module.exports = { requestLogger, errorLogger };
```

### 3. 로깅 사용 예시

```javascript
// 예약 처리에서 로깅 사용
router.post('/', async (req, res) => {
  try {
    logger.info('새 예약 요청 접수', {
      customerInfo: maskSensitiveData(req.body)
    });
    
    // 예약 처리 로직...
    
    logger.info('예약 생성 완료', {
      bookingId: booking.booking_id,
      serviceType: booking.service_type
    });
    
  } catch (error) {
    logger.error('예약 처리 실패', {
      error: error.message,
      customerInfo: maskSensitiveData(req.body)
    });
  }
});
```

---

## 🔧 보안 설정 체크리스트

### 환경 변수 보안
```bash
# .env 파일 보안 설정
chmod 600 .env
chown root:root .env

# 강력한 시크릿 키 생성
SESSION_SECRET=$(openssl rand -base64 32)
CSRF_SECRET=$(openssl rand -base64 32)
```

### 파일 권한 설정
```bash
# 로그 디렉토리 권한
chmod 750 logs/
chown -R app:app logs/

# 설정 파일 권한
chmod 644 server/config/*.js
```

### 정기 보안 점검
- [ ] 의존성 패키지 보안 업데이트
- [ ] 로그 파일 정기 검토
- [ ] Rate Limiting 통계 분석
- [ ] CAPTCHA 우회 시도 모니터링
- [ ] 세션 만료 정책 검토

---

**📞 기술 지원**: 구현 관련 문의사항이 있으시면 개발팀에 연락 바랍니다.  
**🔄 문서 업데이트**: 이 문서는 보안 구현 변경 시 즉시 업데이트됩니다. 