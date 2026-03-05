import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  onlineUsers: string[];
  login: (token: string, user: User) => void;
  logout: () => void;
  setToken: (token: string) => void;
  updateUser: (user: Partial<User>) => void;
  setUserOnline: (userId: string) => void;
  setUserOffline: (userId: string) => void;
  clearOnlineUsers: () => void;
}

function getSavedUser(): User | null {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    localStorage.removeItem('user');
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: getSavedUser(),
  isAuthenticated: !!localStorage.getItem('token'),
  onlineUsers: [],
  login: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null, isAuthenticated: false, onlineUsers: [] });
  },
  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },
  updateUser: (partial) =>
    set((state) => {
      const updated = { ...state.user!, ...partial };
      localStorage.setItem('user', JSON.stringify(updated));
      return { user: updated };
    }),
  setUserOnline: (userId) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.includes(userId)
        ? state.onlineUsers
        : [...state.onlineUsers, userId],
    })),
  setUserOffline: (userId) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.filter((id) => id !== userId),
    })),
  clearOnlineUsers: () => set({ onlineUsers: [] }),
}));
