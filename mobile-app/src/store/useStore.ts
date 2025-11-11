import { create } from 'zustand';

interface User {
  username: string;
}

interface AppState {
  // Auth
  isAuthenticated: boolean;
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;

  // UI
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

const useStore = create<AppState>((set) => ({
  // Auth
  isAuthenticated: !!localStorage.getItem('authToken'),
  user: null,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('pinLockTime');
    set({ user: null, isAuthenticated: false });
  },

  // UI
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
}));

export { useStore };
export default useStore;
