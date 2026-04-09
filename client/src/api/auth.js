import api from './axios';

// POST /api/auth/register  - 회원가입
export const registerAPI = (data) => api.post('/auth/register', data);

// POST /api/auth/login  - 로그인
export const loginAPI = (data) => api.post('/auth/login', data);

// GET /api/auth/me  - 내 정보 조회
export const getMeAPI = () => api.get('/auth/me');

// PUT /api/auth/me  - 내 정보 수정
export const updateMeAPI = (data) => api.put('/auth/me', data);

// PUT /api/auth/me/password  - 비밀번호 변경
export const changePasswordAPI = (data) => api.put('/auth/me/password', data);

// DELETE /api/auth/me  - 회원 탈퇴
export const deleteMeAPI = () => api.delete('/auth/me');
