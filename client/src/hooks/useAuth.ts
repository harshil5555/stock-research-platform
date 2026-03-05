import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import type { AuthResponse } from '@/types';

export function useLogin() {
  const login = useAuthStore((s) => s.login);
  const addToast = useUIStore((s) => s.addToast);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const res = await api.post<AuthResponse>('/auth/login', data);
      return res.data;
    },
    onSuccess: (data) => {
      login(data.token, data.user);
      addToast({ type: 'success', message: 'Welcome back!' });
      navigate('/');
    },
    onError: () => {
      addToast({ type: 'error', message: 'Invalid credentials' });
    },
  });
}
