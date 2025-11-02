import { create } from 'zustand';
import type { User, UserUpdate } from '../types';
import { getErrorMessage } from '../types/error';
import { userService } from '../services';

interface UserState {
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  
  fetchUsers: () => Promise<void>;
  fetchUserById: (id: string) => Promise<void>;
  updateUser: (id: string, data: UserUpdate) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  currentUser: null,
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const users = await userService.getAll();
      set({ users, isLoading: false });
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchUserById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const user = await userService.getById(id);
      set({ currentUser: user, isLoading: false });
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateUser: async (id: string, data: UserUpdate) => {
    set({ isLoading: true, error: null });
    try {
      const user = await userService.update(id, data);
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? user : u)),
        currentUser: user,
        isLoading: false,
      }));
      return user;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteUser: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await userService.delete(id);
      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
        isLoading: false,
      }));
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
