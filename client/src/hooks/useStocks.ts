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
      qc.invalidateQueries({ queryKey: ['dashboard'] });
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
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['stocks'] });
      qc.invalidateQueries({ queryKey: ['stocks', vars.id] });
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

export function useDeleteStock() {
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/stocks/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stocks'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      addToast({ type: 'success', message: 'Stock deleted' });
    },
    onError: () => addToast({ type: 'error', message: 'Failed to delete stock' }),
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

export function useLinkSourceToStock() {
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);
  return useMutation({
    mutationFn: async ({ stockId, sourceId }: { stockId: string; sourceId: string }) => {
      const res = await api.post(`/stocks/${stockId}/link-source`, { sourceId });
      return res.data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['stocks', vars.stockId] });
      addToast({ type: 'success', message: 'Source linked' });
    },
    onError: () => addToast({ type: 'error', message: 'Failed to link source' }),
  });
}

export function useUnlinkSourceFromStock() {
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);
  return useMutation({
    mutationFn: async ({ stockId, sourceId }: { stockId: string; sourceId: string }) => {
      await api.delete(`/stocks/${stockId}/link-source/${sourceId}`);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['stocks', vars.stockId] });
      addToast({ type: 'success', message: 'Source unlinked' });
    },
    onError: () => addToast({ type: 'error', message: 'Failed to unlink source' }),
  });
}

export function useLinkTodoToStock() {
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);
  return useMutation({
    mutationFn: async ({ stockId, todoId }: { stockId: string; todoId: string }) => {
      const res = await api.post(`/stocks/${stockId}/link-todo`, { todoId });
      return res.data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['stocks', vars.stockId] });
      addToast({ type: 'success', message: 'Todo linked' });
    },
    onError: () => addToast({ type: 'error', message: 'Failed to link todo' }),
  });
}

export function useUnlinkTodoFromStock() {
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);
  return useMutation({
    mutationFn: async ({ stockId, todoId }: { stockId: string; todoId: string }) => {
      await api.delete(`/stocks/${stockId}/link-todo/${todoId}`);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['stocks', vars.stockId] });
      addToast({ type: 'success', message: 'Todo unlinked' });
    },
    onError: () => addToast({ type: 'error', message: 'Failed to unlink todo' }),
  });
}
