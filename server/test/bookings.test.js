const request = require('supertest');
const { createTestApp, setupTestDatabase, cleanupTestDatabase } = require('./app');

let app;
let authToken;

describe('Bookings API Tests', () => {
  beforeAll(async () => {
    app = createTestApp();
    await setupTestDatabase();
    
    // 관리자 토큰 획득
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testadmin@example.com',
        password: 'testpassword'
      });
    authToken = loginResponse.body.data.token;
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('POST /api/bookings', () => {
    test('새로운 예약 생성 성공', async () => {
      const bookingData = {
        name: '홍길동',
        phone: '010-1234-5678',
        address: '대전광역시 중구 테스트동 123번지',
        serviceType: '벽걸이형',
        preferredDate: '2024-01-15',
        preferredTime: '14:00',
        message: '2층에 위치한 에어컨입니다.'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('예약 신청이 완료되었습니다');
      expect(response.body.bookingId).toBeDefined();
    });

    test('필수 필드 누락 시 400 에러', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .send({
          name: '홍길동'
          // phone, address, serviceType 누락
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/bookings', () => {
    test('관리자 권한으로 예약 목록 조회 성공', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('토큰 없이 예약 목록 조회 시 401 에러', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
}); 