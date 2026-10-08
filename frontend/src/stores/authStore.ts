import { create } from 'zustand';
import { User } from '@/types/auth';
import { authApi } from '@/lib/api/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email: string, pass: string) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.login(email, pass);
      const user = await authApi.me();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Login failed', isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  initialize: async () => {
    const token = localStorage.getItem('nexora_ai_jwt');
    if (!token) {
      // Auto-login to bypass login screen
      try {
        await authApi.login('admin@nexora.ai', 'AdminPass123!');
        const user = await authApi.me();
        set({ user, isAuthenticated: true, isLoading: false });
        return;
      } catch (e) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }
    }

    try {
      const user = await authApi.me();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('nexora_ai_jwt');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
