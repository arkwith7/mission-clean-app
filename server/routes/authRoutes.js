const express = require('express');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User } = require('../models');
const { generateToken, authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 사용자 ID
 *           example: 1
 *         username:
 *           type: string
 *           description: 사용자명
 *           example: "testuser"
 *         email:
 *           type: string
 *           format: email
 *           description: 이메일 주소
 *           example: "test@example.com"
 *         role:
 *           type: string
 *           enum: [admin, manager, customer]
 *           description: 사용자 역할
 *           example: "customer"
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: 계정 상태
 *           example: "active"
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "로그인이 완료되었습니다."
 *         data:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               description: JWT 토큰
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *             user:
 *               $ref: '#/components/schemas/User'
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: 이메일 주소
 *           example: "admin@aircleankorea.com"
 *         password:
 *           type: string
 *           format: password
 *           description: 비밀번호
 *           example: "admin123!"
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: 사용자명
 *           example: "newuser"
 *         email:
 *           type: string
 *           format: email
 *           description: 이메일 주소
 *           example: "newuser@example.com"
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *           description: 비밀번호 (최소 6자)
 *           example: "password123"
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 회원가입
 *     description: 새로운 사용자 계정을 생성합니다.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: 잘못된 요청 또는 중복된 계정
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               validation_error:
 *                 summary: 입력값 검증 오류
 *                 value:
 *                   success: false
 *                   error: "모든 필드를 입력해주세요."
 *               duplicate_user:
 *                 summary: 중복 계정
 *                 value:
 *                   success: false
 *                   error: "이미 사용 중인 사용자명 또는 이메일입니다."
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 입력값 검증
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: '모든 필드를 입력해주세요.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: '비밀번호는 최소 6자 이상이어야 합니다.'
      });
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: '유효한 이메일 주소를 입력해주세요.'
      });
    }

    // 중복 계정 확인
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: '이미 사용 중인 사용자명 또는 이메일입니다.'
      });
    }

    // 비밀번호 해싱
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // 사용자 생성
    const user = await User.create({
      username,
      email,
      password_hash,
      role: 'customer' // 기본 역할은 고객
    });

    // JWT 토큰 생성
    const token = generateToken(user.user_id);

    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      data: {
        token,
        user: {
          id: user.user_id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    });

  } catch (error) {
    logger.error('회원가입 처리 중 오류', { error: error.message, email: req.body.email });
    res.status(500).json({
      success: false,
      error: '회원가입 처리 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 로그인
 *     description: 이메일과 비밀번호로 로그인하여 JWT 토큰을 발급받습니다.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               message: "로그인이 완료되었습니다."
 *               data:
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   id: 1
 *                   username: "admin"
 *                   email: "admin@aircleankorea.com"
 *                   role: "admin"
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "이메일과 비밀번호를 입력해주세요."
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalid_credentials:
 *                 summary: 잘못된 인증 정보
 *                 value:
 *                   success: false
 *                   error: "잘못된 이메일 또는 비밀번호입니다."
 *               inactive_account:
 *                 summary: 비활성화된 계정
 *                 value:
 *                   success: false
 *                   error: "비활성화된 계정입니다. 관리자에게 문의하세요."
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 입력값 검증
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: '이메일과 비밀번호를 입력해주세요.'
      });
    }

    // 사용자 찾기
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: '잘못된 이메일 또는 비밀번호입니다.'
      });
    }

    // 계정 상태 확인
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: '비활성화된 계정입니다. 관리자에게 문의하세요.'
      });
    }

    // 비밀번호 확인
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: '잘못된 이메일 또는 비밀번호입니다.'
      });
    }

    // 마지막 로그인 시간 업데이트
    await user.update({ last_login: new Date() });

    // JWT 토큰 생성
    const token = generateToken(user.user_id);

    res.json({
      success: true,
      message: '로그인이 완료되었습니다.',
      data: {
        token,
        user: {
          id: user.user_id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    });

  } catch (error) {
    logger.error('로그인 처리 중 오류', { error: error.message, email: req.body.email });
    res.status(500).json({
      success: false,
      error: '로그인 처리 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: 사용자 프로필 조회
 *     description: 현재 로그인된 사용자의 프로필 정보를 조회합니다.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 프로필 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       allOf:
 *                         - $ref: '#/components/schemas/User'
 *                         - type: object
 *                           properties:
 *                             lastLogin:
 *                               type: string
 *                               format: date-time
 *                               description: 마지막 로그인 시간
 *                             createdAt:
 *                               type: string
 *                               format: date-time
 *                               description: 계정 생성 시간
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               no_token:
 *                 summary: 토큰 없음
 *                 value:
 *                   success: false
 *                   error: "액세스 토큰이 필요합니다."
 *               invalid_token:
 *                 summary: 유효하지 않은 토큰
 *                 value:
 *                   success: false
 *                   error: "유효하지 않은 토큰입니다."
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user.user_id,
          username: req.user.username,
          email: req.user.email,
          role: req.user.role,
          status: req.user.status,
          lastLogin: req.user.last_login,
          createdAt: req.user.created_at
        }
      }
    });
  } catch (error) {
    logger.error('프로필 조회 중 오류', { error: error.message, userId: req.user?.user_id });
    res.status(500).json({
      success: false,
      error: '프로필 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: 로그아웃
 *     description: 현재 세션을 종료합니다. (클라이언트에서 토큰을 삭제해야 합니다)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: "로그아웃이 완료되었습니다."
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // JWT는 stateless이므로 클라이언트에서 토큰을 삭제하도록 안내
    res.json({
      success: true,
      message: '로그아웃이 완료되었습니다.'
    });
  } catch (error) {
    logger.error('로그아웃 처리 중 오류', { error: error.message, userId: req.user?.user_id });
    res.status(500).json({
      success: false,
      error: '로그아웃 처리 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router; 