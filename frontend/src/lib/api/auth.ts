import { apiFetch, API_MODE } from './client';
import { TokenResponse, User } from '@/types/auth';
import { mockUser } from './mock/mockData';

export const authApi = {
  login: async (email: string, password: string): Promise<TokenResponse> => {
    if (API_MODE === 'mock') {
      const mockToken = 'mock_jwt_token_' + Date.now();
      localStorage.setItem('revamp_ai_jwt', mockToken);
      return {
        access_token: mockToken,
        token_type: 'bearer',
        user_id: mockUser.id,
        email: mockUser.email,
      };
    }
    const res = await apiFetch<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('revamp_ai_jwt', res.access_token);
    return res;
  },

  me: async (): Promise<User> => {
    if (API_MODE === 'mock') {
      return mockUser;
    }
    return apiFetch<User>('/auth/me');
  },

  logout: async (): Promise<void> => {
    if (API_MODE === 'mock') {
      localStorage.removeItem('revamp_ai_jwt');
      return;
    }
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('revamp_ai_jwt');
    }
  },
};
