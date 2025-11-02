import { create } from 'zustand';
import type { User, Token } from '../types';
import { getErrorMessage } from '../types/error';
import { authService, userService } from '../services';

interface AuthState {
  user: User | null;
  token: Token | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = await authService.login({ username, password });
      const user = await userService.getMe();
      set({ 
        token, 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ 
        error: errorMessage, 
        isAuthenticated: false, 
        isLoading: false 
      });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({ 
      user: null, 
      token: null, 
      isAuthenticated: false 
    });
  },

  fetchCurrentUser: async () => {
    set({ isLoading: true });
    try {
      const user = await userService.getMe();
      set({ user, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
