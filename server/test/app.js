const express = require('express');
const cors = require('cors');
const { sequelize } = require('../models');

// 테스트용 앱 생성
const createTestApp = () => {
  const app = express();

  // 미들웨어 설정
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Routes
  const authRoutes = require('../routes/authRoutes');
  const bookingRoutes = require('../routes/bookingRoutes');
  const customerRoutes = require('../routes/customerRoutes');
  const airconSpecRoutes = require('../routes/airconSpecRoutes');
  const serviceRoutes = require('../routes/serviceRoutes');

  app.use('/api/auth', authRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/aircon-specs', airconSpecRoutes);
  app.use('/api/services', serviceRoutes);

  // 기본 엔드포인트
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Mission Clean API Test Server', 
      version: '1.0.0',
      status: 'healthy'
    });
  });

  app.get('/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      message: 'Mission Clean API is healthy',
      timestamp: new Date().toISOString()
    });
  });

  // 404 핸들러
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: '요청한 리소스를 찾을 수 없습니다.'
    });
  });

  // 에러 핸들러
  app.use((error, req, res, next) => {
    res.status(500).json({
      success: false,
      error: error.message
    });
  });

  return app;
};

// 테스트 데이터베이스 설정
const setupTestDatabase = async () => {
  try {
    await sequelize.sync({ force: true }); // 테스트용으로 매번 새로 생성
    
    // 테스트용 초기 데이터 생성
    const { User } = require('../models');
    const bcrypt = require('bcryptjs');
    
    // 테스트용 관리자 계정
    await User.create({
      username: 'testadmin',
      email: 'testadmin@example.com',
      password_hash: await bcrypt.hash('testpassword', 12),
      role: 'admin',
      status: 'active'
    });

    // 테스트용 매니저 계정
    await User.create({
      username: 'testmanager',
      email: 'testmanager@example.com',
      password_hash: await bcrypt.hash('testpassword', 12),
      role: 'manager',
      status: 'active'
    });

    // 테스트용 고객 계정
    await User.create({
      username: 'testcustomer',
      email: 'testcustomer@example.com',
      password_hash: await bcrypt.hash('testpassword', 12),
      role: 'customer',
      status: 'active'
    });

  } catch (error) {
    console.error('테스트 데이터베이스 설정 오류:', error);
    throw error;
  }
};

// 테스트 데이터베이스 정리
const cleanupTestDatabase = async () => {
  try {
    await sequelize.close();
  } catch (error) {
    console.error('테스트 데이터베이스 정리 오류:', error);
  }
};

module.exports = {
  createTestApp,
  setupTestDatabase,
  cleanupTestDatabase
}; 