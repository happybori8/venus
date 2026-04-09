import axios from 'axios';

/** Vite 개발: client/.env 에 VITE_API_URL=/api 권장 → 프록시로 백엔드(5000) 연결 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    // 로그인/회원가입 실패(401)는 화면에 메시지를 보여야 하므로 리다이렉트하지 않음
    const isPublicAuth =
      url.includes('/auth/login') || url.includes('/auth/register');

    if (status === 401 && !isPublicAuth) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
