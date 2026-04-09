const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

// 모든 라우터에 로그인 + 관리자 권한 필요
router.use(protect, adminOnly);

router.get('/', getUsers);            // 전체 회원 목록 조회 (검색/필터/페이지)
router.post('/', createUser);         // 회원 직접 생성
router.get('/:id', getUser);          // 회원 단건 조회
router.put('/:id', updateUser);       // 회원 정보 수정
router.delete('/:id', deleteUser);    // 회원 삭제
router.patch('/:id/role', updateUserRole); // 회원 권한 변경

module.exports = router;
