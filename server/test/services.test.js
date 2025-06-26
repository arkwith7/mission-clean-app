const request = require('supertest');
const { createTestApp, setupTestDatabase, cleanupTestDatabase } = require('./app');

let app;

describe('Services API Tests', () => {
  beforeAll(async () => {
    app = createTestApp();
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('GET /api/services', () => {
    test('모든 서비스 목록 조회 성공', async () => {
      const response = await request(app)
        .get('/api/services')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/services/:serviceId', () => {
    test('특정 서비스 조회 성공', async () => {
      const response = await request(app)
        .get('/api/services/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
    });

    test('존재하지 않는 서비스 조회 시 404 에러', async () => {
      const response = await request(app)
        .get('/api/services/999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
}); 