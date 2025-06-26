require('dotenv').config({ path: '../.env' });

// 출력 버퍼링 비활성화
process.stdout.setDefaultEncoding('utf8');
process.stderr.setDefaultEncoding('utf8');

const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { sequelize } = require('./models');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3001;

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'MissionClean API',
    version: '1.0.0',
    description: 'API documentation for Mission Clean aircon cleaning service backend',
  },
  servers: [{ url: `http://localhost:${PORT}` }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  security: [{ bearerAuth: [] }],
};
const swaggerSpec = swaggerJsdoc({ swaggerDefinition, apis: ['./routes/*.js'] });

// 보안 헤더 설정
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// CORS 설정
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://aircleankorea.com', 'https://www.aircleankorea.com']
    : true,
  credentials: true
};
app.use(cors(corsOptions));

if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/aircon-specs', require('./routes/airconSpecRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));

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
    await sequelize.sync();
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