import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useUIStore } from '@/stores/uiStore';
import type { Comment } from '@/types';

export function useComments(params: { sourceId?: string; stockId?: string }) {
  const key = params.sourceId ? 'source' : 'stock';
  const id = params.sourceId || params.stockId;
  return useQuery({
    queryKey: ['comments', key, id],
    queryFn: async () => {
      const res = await api.get<Comment[]>('/comments', { params });
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateComment() {
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (data: { content: string; sourceId?: string; stockId?: string; parentId?: string }) => {
      const res = await api.post<Comment>('/comments', data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments'] });
      addToast({ type: 'success', message: 'Comment added' });
    },
    onError: () => addToast({ type: 'error', message: 'Failed to add comment' }),
  });
}
