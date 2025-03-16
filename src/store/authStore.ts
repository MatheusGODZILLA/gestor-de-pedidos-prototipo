import create from 'zustand';

interface AuthState {
  isAuthenticated: unknown;
  user: { id: string; email: string } | null;
  login: (user: { id: string; email: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },
}));
