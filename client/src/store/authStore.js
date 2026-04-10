import { create } from 'zustand';
import { loginAPI, registerAPI, getMeAPI } from '../api/auth';
import useCartStore from './cartStore';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  loading: false,
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (email, password) => {
    set({ loading: true });
    const { data } = await loginAPI({ email, password });
    localStorage.setItem('token', data.token);
    set({ user: data.user, token: data.token, isAuthenticated: true, loading: false });
    return data;
  },

  register: async (formData) => {
    set({ loading: true });
    const { data } = await registerAPI(formData);
    localStorage.setItem('token', data.token);
    set({ user: data.user, token: data.token, isAuthenticated: true, loading: false });
    return data;
  },

  fetchMe: async () => {
    try {
      const { data } = await getMeAPI();
      set({ user: data.user, isAuthenticated: true });
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  logout: () => {
    useCartStore.getState().beforeLogoutPersist();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    useCartStore.getState().loadGuestCart();
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
