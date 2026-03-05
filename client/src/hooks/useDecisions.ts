import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useUIStore } from '@/stores/uiStore';
import type { Decision } from '@/types';

export function useDecisions(stockId: string) {
  return useQuery({
    queryKey: ['decisions', stockId],
    queryFn: async () => {
      const res = await api.get<Decision[]>(`/stocks/${stockId}/decisions`);
      return res.data;
    },
    enabled: !!stockId,
  });
}

export function useCreateDecision() {
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (data: { stockId: string; status: Decision['status']; reasoning?: string | null }) => {
      const { stockId, ...body } = data;
      const res = await api.post<Decision>(`/stocks/${stockId}/decisions`, body);
      return res.data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['decisions', vars.stockId] });
      qc.invalidateQueries({ queryKey: ['stocks'] });
      addToast({ type: 'success', message: 'Decision recorded' });
    },
    onError: () => addToast({ type: 'error', message: 'Failed to record decision' }),
  });
}
