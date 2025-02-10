import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Helper function to get cookie value
function getCookie(name: string): string {
    if (typeof document === 'undefined') return '';
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return decodeURIComponent(parts.pop()?.split(';').shift() || '');
    }
    return '';
}

// Initialize axios defaults only on client side
if (typeof window !== 'undefined') {
    axios.defaults.withCredentials = true;
    axios.defaults.headers.common['X-XSRF-TOKEN'] = getCookie('XSRF-TOKEN');
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    country: string;
    profession: string;
    purpose: 'findWork' | 'provideWork';
    source: string;
}

// Function to get CSRF cookie
export const getCsrfToken = async () => {
    await axios.get(`${API_URL}/sanctum/csrf-cookie`, { withCredentials: true });
};

export const register = async (data: RegisterData) => {
    try {
        await getCsrfToken();
        
        const response = await axios.post(
            `${API_URL}/auth/register`,  // This matches the route
            data,
            { withCredentials: true }
        );

        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        }

        return response.data;
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Registration failed');
        }
        throw new Error('Network error');
    }
};

export const login = async (email: string, password: string) => {
    try {
        // Get CSRF token before making the login request
        await getCsrfToken();

        const response = await axios.post(`${API_URL}/login`, { email, password }, {
            withCredentials: true,
        });

        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        }

        return response.data;
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Login failed');
        }
        throw new Error('Network error');
    }
};

export const logout = async () => {
    try {
        const response = await axios.post(`${API_URL}/logout`);
        return response.data;
    } catch (error: any) {
        throw new Error('Logout failed');
    }
}; 