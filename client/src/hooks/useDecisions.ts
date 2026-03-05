import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useUIStore } from '@/stores/uiStore';
import type { Decision } from '@/types';

export function useDecisions(params?: { stockId?: string; decision?: string }) {
  return useQuery({
    queryKey: ['decisions', params],
    queryFn: async () => {
      const res = await api.get<Decision[]>('/decisions', { params });
      return res.data;
    },
  });
}

export function useCreateDecision() {
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (data: Partial<Decision>) => {
      const res = await api.post<Decision>('/decisions', data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['decisions'] });
      qc.invalidateQueries({ queryKey: ['stocks'] });
      addToast({ type: 'success', message: 'Decision recorded' });
    },
    onError: () => addToast({ type: 'error', message: 'Failed to record decision' }),
  });
}

export function useUpdateDecision() {
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Decision> & { id: string }) => {
      const res = await api.patch<Decision>(`/decisions/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['decisions'] });
      qc.invalidateQueries({ queryKey: ['stocks'] });
      addToast({ type: 'success', message: 'Decision updated' });
    },
    onError: () => addToast({ type: 'error', message: 'Failed to update decision' }),
  });
}
