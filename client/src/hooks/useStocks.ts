import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useUIStore } from '@/stores/uiStore';
import type { Stock, Analysis } from '@/types';

export function useStocks(params?: { search?: string; sector?: string; decisionStatus?: string }) {
  return useQuery({
    queryKey: ['stocks', params],
    queryFn: async () => {
      const res = await api.get<Stock[]>('/stocks', { params });
      return res.data;
    },
  });
}

export function useStock(id: string) {
  return useQuery({
    queryKey: ['stocks', id],
    queryFn: async () => {
      const res = await api.get<Stock>(`/stocks/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateStock() {
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (data: { ticker: string; companyName: string; sector?: string | null; notes?: string | null }) => {
      const res = await api.post<Stock>('/stocks', data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stocks'] });
      addToast({ type: 'success', message: 'Stock added' });
    },
    onError: () => addToast({ type: 'error', message: 'Failed to add stock' }),
  });
}

export function useUpdateStock() {
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Stock> & { id: string }) => {
      const res = await api.put<Stock>(`/stocks/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stocks'] });
      addToast({ type: 'success', message: 'Stock updated' });
    },
    onError: () => addToast({ type: 'error', message: 'Failed to update stock' }),
  });
}

export function useStockAnalyses(stockId: string) {
  return useQuery({
    queryKey: ['analyses', stockId],
    queryFn: async () => {
      const res = await api.get<Analysis[]>(`/stocks/${stockId}/analyses`);
      return res.data;
    },
    enabled: !!stockId,
  });
}

export function useMyAnalysis(stockId: string) {
  return useQuery({
    queryKey: ['analyses', stockId, 'mine'],
    queryFn: async () => {
      const res = await api.get<Analysis | null>(`/stocks/${stockId}/analyses/mine`);
      return res.data;
    },
    enabled: !!stockId,
  });
}

export function useUpsertAnalysis() {
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (data: { stockId: string; thesis?: string | null; bullCase?: string | null; bearCase?: string | null; notes?: string | null; targetPrice?: string | null }) => {
      const { stockId, ...body } = data;
      const res = await api.put<Analysis>(`/stocks/${stockId}/analyses`, body);
      return res.data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['analyses', vars.stockId] });
      addToast({ type: 'success', message: 'Analysis saved' });
    },
    onError: () => addToast({ type: 'error', message: 'Failed to save analysis' }),
  });
}
