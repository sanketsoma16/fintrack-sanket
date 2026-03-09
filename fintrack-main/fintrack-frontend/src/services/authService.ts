import api from './api';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  name: string;
  email: string;
}

export const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('fintrack_token', response.data.token);
      localStorage.setItem('fintrack_user', JSON.stringify({
        name: response.data.name,
        email: response.data.email
      }));
    }
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('fintrack_token', response.data.token);
      localStorage.setItem('fintrack_user', JSON.stringify({
        name: response.data.name,
        email: response.data.email
      }));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('fintrack_token');
    localStorage.removeItem('fintrack_user');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('fintrack_token');
  },

  getUser: () => {
    const userStr = localStorage.getItem('fintrack_user');
    return userStr ? JSON.parse(userStr) : null;
  }
};



