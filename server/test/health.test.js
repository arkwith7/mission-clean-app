const request = require('supertest');
const { createTestApp, setupTestDatabase, cleanupTestDatabase } = require('./app');

let app;

describe('Health & Basic API Tests', () => {
  beforeAll(async () => {
    app = createTestApp();
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('GET /', () => {
    test('루트 엔드포인트 정상 응답', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body.message).toBe('Mission Clean API Test Server');
      expect(response.body.version).toBe('1.0.0');
      expect(response.body.status).toBe('healthy');
    });
  });

  describe('GET /health', () => {
    test('헬스체크 정상 응답', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body.message).toBe('Mission Clean API is healthy');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('GET /api/customers', () => {
    test('고객 생성 API 테스트', async () => {
      const customerData = {
        name: '테스트 고객',
        phone: '010-9999-8888',
        email: 'test@example.com',
        address: '테스트 주소'
      };

      const response = await request(app)
        .post('/api/customers')
        .send(customerData)
        .expect(200);

      expect(response.body.name).toBe(customerData.name);
      expect(response.body.phone).toBe(customerData.phone);
    });
  });

  describe('404 Error Handling', () => {
    test('존재하지 않는 경로 접근 시 404 에러', async () => {
      const response = await request(app)
        .get('/nonexistent-path')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('요청한 리소스를 찾을 수 없습니다.');
    });
  });
}); 