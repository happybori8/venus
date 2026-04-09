import api from './axios';

export const createOrderAPI = (data) => api.post('/orders', data);
export const getMyOrdersAPI = () => api.get('/orders/my');
export const getOrderAPI = (id) => api.get(`/orders/${id}`);
export const payOrderAPI = (id, data) => api.put(`/orders/${id}/pay`, data);
export const getAllOrdersAPI = () => api.get('/orders');
export const updateOrderStatusAPI = (id, status) => api.put(`/orders/${id}/status`, { status });
