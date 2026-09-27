import { create } from 'zustand';

export interface ToastNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
}

interface UIState {
  isSidebarCollapsed: boolean;
  isCommandPaletteOpen: boolean;
  activeJobId: string | null;
  notifications: ToastNotification[];
  toggleSidebar: () => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setActiveJobId: (jobId: string | null) => void;
  addNotification: (notification: Omit<ToastNotification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarCollapsed: false,
  isCommandPaletteOpen: false,
  activeJobId: null,
  notifications: [],

  setSidebarCollapsed: (collapsed: boolean) => set({ isSidebarCollapsed: collapsed }),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  setCommandPaletteOpen: (open: boolean) => set({ isCommandPaletteOpen: open }),
  setActiveJobId: (jobId: string | null) => set({ activeJobId: jobId }),

  addNotification: (notification) => {
    const id = 'notif_' + Date.now() + Math.random().toString(36).substring(2, 5);
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }));
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, 5000);
  },

  removeNotification: (id: string) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
