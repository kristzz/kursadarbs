import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Initialize axios instance
export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// Request interceptor
api.interceptors.request.use(config => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  const csrfToken = getCookie('XSRF-TOKEN');
  if (csrfToken) {
    config.headers['X-XSRF-TOKEN'] = csrfToken;
  }
  
  return config;
});

function getCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
  return '';
}

export const getCsrfToken = async () => {
  await axios.get(`${API_URL}/sanctum/csrf-cookie`, { withCredentials: true });
};

export const login = async (email: string, password: string) => {
  try {
    await getCsrfToken();
    const response = await api.post('/login', { email, password });
    
    if (response.data.token) {
      Cookies.set('auth_token', response.data.token, {
        expires: 30,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict'
      });
    }
    
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const register = async (data: any) => {
  try {
    await getCsrfToken();
    const response = await api.post('/auth/register', data);
    
    if (response.data.token) {
      Cookies.set('auth_token', response.data.token, {
        expires: 30,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict'
      });
    }
    
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

export const logout = async () => {
  try {
    await api.post('/logout');
    Cookies.remove('auth_token');
    return true;
  } catch (error) {
    throw new Error('Logout failed');
  }
};