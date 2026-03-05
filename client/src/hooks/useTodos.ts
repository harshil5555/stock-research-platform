import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useUIStore } from '@/stores/uiStore';
import type { Todo } from '@/types';

export function useTodos(params?: { status?: string; priority?: string; stockId?: string; sourceId?: string }) {
  return useQuery({
    queryKey: ['todos', params],
    queryFn: async () => {
      const res = await api.get<Todo[]>('/todos', { params });
      return res.data;
    },
  });
}

export function useTodo(id: string) {
  return useQuery({
    queryKey: ['todos', id],
    queryFn: async () => {
      const res = await api.get<Todo>(`/todos/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateTodo() {
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (data: Partial<Todo>) => {
      const res = await api.post<Todo>('/todos', data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todos'] });
      addToast({ type: 'success', message: 'Todo created' });
    },
    onError: () => addToast({ type: 'error', message: 'Failed to create todo' }),
  });
}

export function useUpdateTodo() {
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Todo> & { id: string }) => {
      const res = await api.patch<Todo>(`/todos/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todos'] });
      addToast({ type: 'success', message: 'Todo updated' });
    },
    onError: () => addToast({ type: 'error', message: 'Failed to update todo' }),
  });
}

export function useDeleteTodo() {
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/todos/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todos'] });
      addToast({ type: 'success', message: 'Todo deleted' });
    },
    onError: () => addToast({ type: 'error', message: 'Failed to delete todo' }),
  });
}
