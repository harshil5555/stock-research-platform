import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useUIStore } from '@/stores/uiStore';
import type { Todo } from '@/types';

export function useTodos(params?: { status?: string; assignedTo?: string; search?: string; sort?: string; order?: string }) {
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
      const res = await api.put<Todo>(`/todos/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todos'] });
      addToast({ type: 'success', message: 'Todo updated' });
    },
    onError: () => addToast({ type: 'error', message: 'Failed to update todo' }),
  });
}

export function useUpdateTodoStatus() {
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Todo['status'] }) => {
      const res = await api.patch<Todo>(`/todos/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: () => addToast({ type: 'error', message: 'Failed to update status' }),
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
