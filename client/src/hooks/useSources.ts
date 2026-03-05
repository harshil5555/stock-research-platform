import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useUIStore } from '@/stores/uiStore';
import type { Source } from '@/types';

export function useSources(params?: { sourceType?: string; search?: string }) {
  return useQuery({
    queryKey: ['sources', params],
    queryFn: async () => {
      const res = await api.get<Source[]>('/sources', { params });
      return res.data;
    },
  });
}

export function useSource(id: string) {
  return useQuery({
    queryKey: ['sources', id],
    queryFn: async () => {
      const res = await api.get<Source>(`/sources/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateSource() {
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (data: Partial<Source> & { stockIds?: string[]; todoIds?: string[] }) => {
      const res = await api.post<Source>('/sources', data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sources'] });
      addToast({ type: 'success', message: 'Source created' });
    },
    onError: () => addToast({ type: 'error', message: 'Failed to create source' }),
  });
}

export function useUpdateSource() {
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Source> & { id: string; stockIds?: string[]; todoIds?: string[] }) => {
      const res = await api.put<Source>(`/sources/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sources'] });
      addToast({ type: 'success', message: 'Source updated' });
    },
    onError: () => addToast({ type: 'error', message: 'Failed to update source' }),
  });
}

export function useDeleteSource() {
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/sources/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sources'] });
      addToast({ type: 'success', message: 'Source deleted' });
    },
    onError: () => addToast({ type: 'error', message: 'Failed to delete source' }),
  });
}

export function useUploadAttachment() {
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async ({ sourceId, file }: { sourceId: string; file: File }) => {
      const form = new FormData();
      form.append('file', file);
      const res = await api.post(`/sources/${sourceId}/attachments`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['sources', vars.sourceId] });
      addToast({ type: 'success', message: 'File uploaded' });
    },
    onError: () => addToast({ type: 'error', message: 'Upload failed' }),
  });
}

export function useLinkStock() {
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async ({ sourceId, stockIds }: { sourceId: string; stockIds: string[] }) => {
      const res = await api.put(`/sources/${sourceId}`, { stockIds });
      return res.data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['sources', vars.sourceId] });
      addToast({ type: 'success', message: 'Stock linked' });
    },
    onError: () => addToast({ type: 'error', message: 'Failed to link stock' }),
  });
}

export function useUnlinkStock() {
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async ({ sourceId, stockIds }: { sourceId: string; stockIds: string[] }) => {
      const res = await api.put(`/sources/${sourceId}`, { stockIds });
      return res.data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['sources', vars.sourceId] });
      addToast({ type: 'success', message: 'Stock unlinked' });
    },
    onError: () => addToast({ type: 'error', message: 'Failed to unlink stock' }),
  });
}
