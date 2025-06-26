#!/usr/bin/env node

require('dotenv').config();
const db = require('../models');
const { sequelize } = db;
const { runSeeders } = require('../seeders');
const logger = require('../utils/logger');

const main = async () => {
  try {
    logger.info('데이터베이스 연결을 확인합니다...');
    
    // 데이터베이스 연결 테스트
    await sequelize.authenticate();
    logger.info('데이터베이스 연결 성공');

    // 테이블 동기화
    logger.info('데이터베이스 테이블을 동기화합니다...');
    await sequelize.sync();
    logger.info('테이블 동기화 완료');

    // 시더 실행
    await runSeeders();

    logger.system('시더 실행이 완료되었습니다!');
    process.exit(0);

  } catch (error) {
    logger.error('시더 실행 중 오류가 발생했습니다', { error: error.message });
    process.exit(1);
  }
};

// 스크립트가 직접 실행될 때만 main 함수 실행
if (require.main === module) {
  main();
}

module.exports = main; 