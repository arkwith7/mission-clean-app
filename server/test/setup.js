// 테스트 환경 설정
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only-do-not-use-in-production';
process.env.JWT_EXPIRES_IN = '1h';
process.env.LOG_LEVEL = 'ERROR'; // 테스트 중 로그 최소화

// 전역 테스트 타임아웃 설정
jest.setTimeout(10000);

// 테스트 후 정리를 위한 전역 훅
afterAll(async () => {
  // 모든 테스트 완료 후 정리 작업
  if (global.testServer) {
    await global.testServer.close();
  }
}); 