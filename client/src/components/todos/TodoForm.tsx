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
}

export default function TodoForm({ onClose, todo }: TodoFormProps) {
  const isEdit = !!todo;
  const [title, setTitle] = useState(todo?.title ?? '');
  const [description, setDescription] = useState(todo?.description ?? '');
  const [priority, setPriority] = useState<string>(String(todo?.priority ?? 5));
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title,
      description: description || undefined,
      priority: parseInt(priority, 10),
    };

    if (isEdit) {
      updateTodo.mutate({ id: todo.id, ...data }, { onSuccess: onClose });
    } else {
      createTodo.mutate(
        {
          ...data,
          status: 'pending',
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
      <Select
        label="Priority (0=lowest, 10=highest)"
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        options={[
          { value: '10', label: '10 - Critical' },
          { value: '8', label: '8 - High' },
          { value: '5', label: '5 - Medium' },
          { value: '3', label: '3 - Low' },
          { value: '0', label: '0 - None' },
        ]}
      />
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
