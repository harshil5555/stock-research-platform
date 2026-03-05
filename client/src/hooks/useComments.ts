import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useUIStore } from '@/stores/uiStore';
import type { Comment } from '@/types';

export function useComments(params: { entityType: 'source' | 'stock' | 'todo'; entityId: string }) {
  return useQuery({
    queryKey: ['comments', params.entityType, params.entityId],
    queryFn: async () => {
      const res = await api.get<Comment[]>('/comments', { params });
      return res.data;
    },
    enabled: !!params.entityId,
  });
}

export function useCreateComment() {
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (data: { body: string; entityType: 'source' | 'stock' | 'todo'; entityId: string; parentId?: string }) => {
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
