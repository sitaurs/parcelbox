import { create } from 'zustand';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  isVisible: boolean;
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  hideToast: () => void;
}

export const useToast = create<ToastState>((set) => ({
  message: '',
  type: 'info',
  isVisible: false,
  showToast: (message, type) => set({ message, type, isVisible: true }),
  hideToast: () => set({ isVisible: false }),
}));

// Convenience functions
export const toast = {
  success: (message: string) => useToast.getState().showToast(message, 'success'),
  error: (message: string) => useToast.getState().showToast(message, 'error'),
  warning: (message: string) => useToast.getState().showToast(message, 'warning'),
  info: (message: string) => useToast.getState().showToast(message, 'info'),
};
