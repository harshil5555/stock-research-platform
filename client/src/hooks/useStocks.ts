import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useUIStore } from '@/stores/uiStore';
import type { Stock, Analysis } from '@/types';

export function useStocks(params?: { search?: string; sector?: string }) {
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
    mutationFn: async (data: Partial<Stock>) => {
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
      const res = await api.patch<Stock>(`/stocks/${id}`, data);
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

export function useCreateAnalysis() {
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (data: { stockId: string; title: string; content: string }) => {
      const res = await api.post<Analysis>(`/stocks/${data.stockId}/analyses`, data);
      return res.data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['analyses', vars.stockId] });
      addToast({ type: 'success', message: 'Analysis saved' });
    },
    onError: () => addToast({ type: 'error', message: 'Failed to save analysis' }),
  });
}
