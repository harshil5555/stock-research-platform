import { useState } from 'react';
import { Link as LinkIcon } from 'lucide-react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { useTodos } from '@/hooks/useTodos';
import { useLinkTodo } from '@/hooks/useSources';

interface TodoLinkerProps {
  sourceId: string;
  linkedTodoIds: string[];
}

export default function TodoLinker({ sourceId, linkedTodoIds }: TodoLinkerProps) {
  const [selectedTodo, setSelectedTodo] = useState('');
  const { data: todos } = useTodos();
  const linkTodo = useLinkTodo();

  const available = (todos || []).filter((t) => !linkedTodoIds.includes(t.id));

  if (available.length === 0) {
    return (
      <p className="text-xs text-[var(--text-secondary)]">No todos available to link</p>
    );
  }

  return (
    <div className="flex items-end gap-3">
      <div className="flex-1">
        <Select
          label="Link Todo"
          value={selectedTodo}
          onChange={(e) => setSelectedTodo(e.target.value)}
          options={[
            { value: '', label: 'Select a todo...' },
            ...available.map((t) => ({ value: t.id, label: t.title })),
          ]}
        />
      </div>
      <Button
        size="sm"
        disabled={!selectedTodo}
        loading={linkTodo.isPending}
        onClick={() => {
          linkTodo.mutate({ sourceId, todoId: selectedTodo }, {
            onSuccess: () => setSelectedTodo(''),
          });
        }}
      >
        <LinkIcon size={14} />
        Link
      </Button>
    </div>
  );
}
