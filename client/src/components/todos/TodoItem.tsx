import { motion } from 'framer-motion';
import { GripVertical, Trash2, Pencil } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { cn, priorityLabel, formatRelative } from '@/lib/utils';
import { useUpdateTodoStatus, useDeleteTodo } from '@/hooks/useTodos';
import type { Todo } from '@/types';

interface TodoItemProps {
  todo: Todo;
  compact?: boolean;
  onEdit?: (todo: Todo) => void;
}

export default function TodoItem({ todo, compact, onEdit }: TodoItemProps) {
  const updateTodoStatus = useUpdateTodoStatus();
  const deleteTodo = useDeleteTodo();

  const statusOptions = ['pending', 'in_progress', 'done'] as const;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={cn(
        'group bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 hover:shadow-sm transition-shadow',
        todo.status === 'done' && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
        <GripVertical size={16} className="mt-1 text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity cursor-grab shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4
              className={cn(
                'text-sm font-medium text-[var(--text-primary)] truncate',
                todo.status === 'done' && 'line-through'
              )}
            >
              {todo.title}
            </h4>
            <Badge className="shrink-0">
              P{todo.priority} {priorityLabel(todo.priority)}
            </Badge>
          </div>
          {!compact && todo.description && (
            <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-2">
              {todo.description}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
            <span>{formatRelative(todo.createdAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <select
            value={todo.status}
            onChange={(e) => updateTodoStatus.mutate({ id: todo.id, status: e.target.value as Todo['status'] })}
            className="text-xs bg-transparent border border-[var(--border)] rounded-lg px-2 py-1 text-[var(--text-secondary)] focus:outline-none"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </select>
          {onEdit && (
            <button
              onClick={() => onEdit(todo)}
              aria-label="Edit todo"
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--hover)] opacity-0 group-hover:opacity-100 transition-all"
            >
              <Pencil size={14} />
            </button>
          )}
          <button
            onClick={() => {
              if (window.confirm('Delete this todo?')) {
                deleteTodo.mutate(todo.id);
              }
            }}
            aria-label="Delete todo"
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--color-sell)] hover:bg-[var(--hover)] opacity-0 group-hover:opacity-100 transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
