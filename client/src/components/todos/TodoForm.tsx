import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { useCreateTodo, useUpdateTodo } from '@/hooks/useTodos';
import type { Todo } from '@/types';

interface TodoFormProps {
  onClose: () => void;
  todo?: Todo;
  defaultStockId?: string;
  defaultSourceId?: string;
}

export default function TodoForm({ onClose, todo, defaultStockId, defaultSourceId }: TodoFormProps) {
  const isEdit = !!todo;
  const [title, setTitle] = useState(todo?.title ?? '');
  const [description, setDescription] = useState(todo?.description ?? '');
  const [priority, setPriority] = useState<string>(todo?.priority ?? 'medium');
  const [dueDate, setDueDate] = useState(todo?.dueDate?.split('T')[0] ?? '');
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title,
      description: description || null,
      priority: priority as Todo['priority'],
      dueDate: dueDate || null,
    };

    if (isEdit) {
      updateTodo.mutate({ id: todo.id, ...data }, { onSuccess: onClose });
    } else {
      createTodo.mutate(
        {
          ...data,
          stockId: defaultStockId || null,
          sourceId: defaultSourceId || null,
          status: 'todo',
        },
        { onSuccess: onClose }
      );
    }
  };

  const isPending = createTodo.isPending || updateTodo.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        required
      />
      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Add details..."
        rows={3}
      />
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          options={[
            { value: 'immediate', label: 'Immediate' },
            { value: 'high', label: 'High' },
            { value: 'medium', label: 'Medium' },
            { value: 'low', label: 'Low' },
          ]}
        />
        <Input
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={isPending}>
          {isEdit ? 'Update Todo' : 'Create Todo'}
        </Button>
      </div>
    </form>
  );
}
