import api from './axios';

/** 주문 생성 (체크아웃) */
export const createOrderAPI = (data) => api.post('/orders', data);
/** 내 주문 목록 */
export const getMyOrdersAPI = () => api.get('/orders/my');
/** 주문 단건 (본인·관리자) */
export const getOrderAPI = (id) => api.get(`/orders/${id}`);
