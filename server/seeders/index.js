const bcrypt = require('bcryptjs');
const db = require('../models');
const { User, Customer, Service } = db;
const logger = require('../utils/logger');

// 환경 변수에서 기본 패스워드 가져오기 (설정되지 않은 경우 강력한 기본값 사용)
const getDefaultPassword = (role) => {
  const envKey = `DEFAULT_${role.toUpperCase()}_PASSWORD`;
  return process.env[envKey] || `MissionClean${role}2024!@#$`;
};

const seedUsers = async () => {
  try {
    logger.info('초기 사용자 데이터를 확인합니다...');

    // 기존 사용자 수 확인
    const userCount = await User.count();
    
    if (userCount > 0) {
      logger.info('이미 사용자 데이터가 존재합니다. 스킵합니다.');
      return;
    }

    logger.info('초기 사용자 데이터를 생성합니다...');

    const saltRounds = 12;

    // 관리자 계정 생성
    const adminPassword = getDefaultPassword('admin');
    const adminPasswordHash = await bcrypt.hash(adminPassword, saltRounds);
    const admin = await User.create({
      username: 'admin',
      email: 'admin@aircleankorea.com',
      password_hash: adminPasswordHash,
      role: 'admin',
      status: 'active'
    });

    logger.info('관리자 계정이 생성되었습니다.', { email: 'admin@aircleankorea.com' });

    // 매니저 계정 생성
    const managerPassword = getDefaultPassword('manager');
    const managerPasswordHash = await bcrypt.hash(managerPassword, saltRounds);
    const manager = await User.create({
      username: 'manager',
      email: 'manager@aircleankorea.com',
      password_hash: managerPasswordHash,
      role: 'manager',
      status: 'active'
    });

    logger.info('매니저 계정이 생성되었습니다.', { email: 'manager@aircleankorea.com' });

    // 테스트용 일반 사용자 계정 생성 (개발 환경에서만)
    if (process.env.NODE_ENV === 'development') {
      const customerPassword = getDefaultPassword('customer');
      const customerPasswordHash = await bcrypt.hash(customerPassword, saltRounds);
      const customer = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: customerPasswordHash,
        role: 'customer',
        status: 'active'
      });

      logger.info('테스트 고객 계정이 생성되었습니다.', { email: 'test@example.com' });

      // 고객 정보도 함께 생성
      await Customer.create({
        name: '테스트 고객',
        phone: '010-1234-5678',
        email: 'test@example.com',
        address: '대전광역시 중구 테스트동 123번지',
        user_id: customer.user_id
      });
    }

    logger.info('초기 사용자 데이터 생성이 완료되었습니다!');
    
    return {
      admin,
      manager
    };

  } catch (error) {
    logger.error('초기 사용자 데이터 생성 중 오류', { error: error.message });
    throw error;
  }
};

const seedServices = async () => {
  try {
    logger.info('초기 서비스 데이터를 확인합니다...');

    // Service 모델이 존재하는지 확인
    if (!Service) {
      logger.warn('Service 모델이 존재하지 않습니다. 스킵합니다.');
      return;
    }

    const serviceCount = await Service.count();
    
    if (serviceCount > 0) {
      logger.info('이미 서비스 데이터가 존재합니다. 스킵합니다.');
      return;
    }

    logger.info('초기 서비스 데이터를 생성합니다...');

    const services = [
      {
        service_name: '벽걸이형 에어컨 청소',
        service_type: '일반',
        base_price: 80000,
        description: '벽걸이형 실내기 완전 분해 청소, 필터 교체 및 청소, 드레인 청소, 기본 점검 서비스',
        duration_minutes: 90
      },
      {
        service_name: '스탠드형 에어컨 청소',
        service_type: '일반',
        base_price: 130000,
        description: '스탠드형 실내기 완전 분해 청소, 대형 필터 교체 및 청소, 드레인 청소, 정밀 점검 서비스',
        duration_minutes: 120
      },
      {
        service_name: '시스템 에어컨 1way 청소',
        service_type: '시스템',
        base_price: 120000,
        description: '1way 시스템 에어컨 전용 청소, 덕트 청소 포함, 항균 코팅 서비스, 정밀 점검 및 AS',
        duration_minutes: 100
      },
      {
        service_name: '시스템 에어컨 천정형 4way 청소',
        service_type: '시스템',
        base_price: 150000,
        description: '천정형 4way 시스템 에어컨 청소, 4방향 덕트 청소 포함, 항균 코팅 서비스, 정밀 점검 및 AS',
        duration_minutes: 150
      },
      {
        service_name: '실외기 청소',
        service_type: '실외기',
        base_price: 60000,
        description: '실외기 고압 세척, 방열판 청소, 배수관 청소, 냉매 압력 점검',
        duration_minutes: 60
      }
    ];

    for (const serviceData of services) {
      await Service.create(serviceData);
    }

    logger.info('초기 서비스 데이터가 생성되었습니다.');

  } catch (error) {
    logger.error('초기 서비스 데이터 생성 중 오류', { error: error.message });
    // 서비스 데이터는 필수가 아니므로 오류가 발생해도 계속 진행
  }
};

const runSeeders = async () => {
  try {
    logger.info('초기 데이터 적재를 시작합니다...');
    
    await seedUsers();
    await seedServices();
    
    logger.info('모든 초기 데이터 적재가 완료되었습니다!');
    
    if (process.env.NODE_ENV === 'development') {
      logger.info('생성된 계정 정보:');
      logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logger.info('관리자 계정:');
      logger.info('   이메일: admin@aircleankorea.com');
      logger.info('   비밀번호: ' + getDefaultPassword('admin'));
      logger.info('   권한: 관리자 (모든 기능 접근 가능)');
      logger.info('');
      logger.info('매니저 계정:');
      logger.info('   이메일: manager@aircleankorea.com');
      logger.info('   비밀번호: ' + getDefaultPassword('manager'));
      logger.info('   권한: 매니저 (예약 관리 등)');
      logger.info('');
      logger.info('테스트 고객 계정:');
      logger.info('   이메일: test@example.com');
      logger.info('   비밀번호: ' + getDefaultPassword('customer'));
      logger.info('   권한: 일반 고객');
      logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } else {
      logger.warn('프로덕션 환경에서는 기본 패스워드를 즉시 변경하세요!');
      logger.info('관리자 계정: admin@aircleankorea.com');
      logger.info('매니저 계정: manager@aircleankorea.com');
    }

  } catch (error) {
    logger.error('초기 데이터 적재 중 오류가 발생했습니다', { error: error.message });
    throw error;
  }
};

module.exports = {
  runSeeders,
  seedUsers,
  seedServices
}; 