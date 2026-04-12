import api from './axios';

/**
 * 백엔드 매핑 (server.js → 라우트)
 * GET/POST/PUT/DELETE /api/products → productRoutes (등록·수정·삭제는 protect + adminOnly)
 * POST /api/cloudinary/sign → cloudinaryRoutes
 */

/** 관리자 — 회원 */
export const adminGetUsers = (params) => api.get('/users', { params });
export const adminGetUser = (id) => api.get(`/users/${id}`);
export const adminUpdateUser = (id, data) => api.put(`/users/${id}`, data);
export const adminDeleteUser = (id) => api.delete(`/users/${id}`);
export const adminPatchUserRole = (id, role) => api.patch(`/users/${id}/role`, { role });

/** 관리자 — 상품 (목록은 공개 GET, 등록/수정/삭제는 관리자) */
export const adminGetProducts = (params) => api.get('/products', { params });
export const adminCreateProduct = (data) => api.post('/products', data);
export const adminUpdateProduct = (id, data) => api.put(`/products/${id}`, data);
export const adminDeleteProduct = (id) => api.delete(`/products/${id}`);

/** Cloudinary Upload Widget — 서명 업로드(관리자, 로그인 토큰 필요) */
export const cloudinarySignUpload = (paramsToSign) =>
  api.post('/cloudinary/sign', { params_to_sign: paramsToSign });

/** 관리자 — 주문 */
export const adminGetOrders = () => api.get('/orders');
export const adminUpdateOrderStatus = (id, status) =>
  api.put(`/orders/${id}/status`, { status });
