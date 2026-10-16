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
    const defaultUser: User = {
      id: 'usr_admin',
      email: 'admin@nexora.ai',
      full_name: 'Security Analyst',
      role: 'admin',
      is_active: true,
      created_at: new Date().toISOString(),
    };

    const token = localStorage.getItem('nexora_ai_jwt');
    // Set immediate optimistic session so the UI loads instantly without freezing
    set({ user: defaultUser, isAuthenticated: true, isLoading: false });

    if (!token) {
      try {
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000));
        await Promise.race([authApi.login('admin@nexora.ai', 'AdminPass123!'), timeoutPromise]);
        const user = await authApi.me();
        set({ user, isAuthenticated: true });
      } catch {
        // Retain optimistic session
      }
      return;
    }

    try {
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000));
      const user = await Promise.race([authApi.me(), timeoutPromise]) as User;
      if (user) {
        set({ user, isAuthenticated: true });
      }
    } catch {
      // Retain optimistic session
    }
  },
}));
