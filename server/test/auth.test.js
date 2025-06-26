const request = require('supertest');
const { createTestApp, setupTestDatabase, cleanupTestDatabase } = require('./app');

let app;

describe('Auth API Tests', () => {
  beforeAll(async () => {
    app = createTestApp();
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('POST /api/auth/register', () => {
    test('새로운 사용자 회원가입 성공', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('회원가입이 완료되었습니다.');
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.username).toBe(userData.username);
      expect(response.body.data.user.role).toBe('customer');
    });

    test('필수 필드 누락 시 400 에러', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser'
          // email, password 누락
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('모든 필드를 입력해주세요.');
    });

    test('짧은 비밀번호 시 400 에러', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: '123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('비밀번호는 최소 6자 이상이어야 합니다.');
    });

    test('잘못된 이메일 형식 시 400 에러', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'invalid-email',
          password: 'password123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('유효한 이메일 주소를 입력해주세요.');
    });

    test('중복 이메일 시 400 에러', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'duplicateuser',
          email: 'testadmin@example.com', // 이미 존재하는 이메일
          password: 'password123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('이미 사용 중인 사용자명 또는 이메일입니다.');
    });
  });

  describe('POST /api/auth/login', () => {
    test('올바른 자격증명으로 로그인 성공', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testadmin@example.com',
          password: 'testpassword'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('로그인이 완료되었습니다.');
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe('testadmin@example.com');
      expect(response.body.data.user.role).toBe('admin');
    });

    test('필수 필드 누락 시 400 에러', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
          // password 누락
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('이메일과 비밀번호를 입력해주세요.');
    });

    test('존재하지 않는 사용자 로그인 시 401 에러', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('잘못된 이메일 또는 비밀번호입니다.');
    });

    test('잘못된 비밀번호로 로그인 시 401 에러', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testadmin@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('잘못된 이메일 또는 비밀번호입니다.');
    });
  });

  describe('GET /api/auth/profile', () => {
    let authToken;

    beforeEach(async () => {
      // 로그인하여 토큰 획득
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testadmin@example.com',
          password: 'testpassword'
        });
      
      authToken = loginResponse.body.data.token;
    });

    test('유효한 토큰으로 프로필 조회 성공', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('testadmin@example.com');
      expect(response.body.data.user.role).toBe('admin');
      expect(response.body.data.user.password_hash).toBeUndefined(); // 비밀번호는 제외
    });

    test('토큰 없이 프로필 조회 시 401 에러', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('액세스 토큰이 필요합니다.');
    });

    test('잘못된 토큰으로 프로필 조회 시 401 에러', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('유효하지 않은 토큰입니다.');
    });
  });

  describe('POST /api/auth/logout', () => {
    let authToken;

    beforeEach(async () => {
      // 로그인하여 토큰 획득
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testadmin@example.com',
          password: 'testpassword'
        });
      
      authToken = loginResponse.body.data.token;
    });

    test('유효한 토큰으로 로그아웃 성공', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('로그아웃이 완료되었습니다.');
    });

    test('토큰 없이 로그아웃 시 401 에러', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('액세스 토큰이 필요합니다.');
    });
  });
}); 