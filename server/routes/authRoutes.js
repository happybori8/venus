const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateMe,
  changePassword,
  deleteMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// 인증 (Public)
router.post('/register', register);   // 회원가입
router.post('/login', login);         // 로그인

// 내 계정 관리 (로그인 필요)
router.get('/me', protect, getMe);                      // 내 정보 조회
router.put('/me', protect, updateMe);                   // 내 정보 수정
router.put('/me/password', protect, changePassword);    // 비밀번호 변경
router.delete('/me', protect, deleteMe);                // 회원 탈퇴

module.exports = router;
