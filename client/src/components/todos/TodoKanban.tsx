import { motion, AnimatePresence } from 'framer-motion';
import TodoItem from './TodoItem';
import { useUpdateTodo } from '@/hooks/useTodos';
import type { Todo } from '@/types';

interface TodoKanbanProps {
  todos: Todo[];
  onEdit?: (todo: Todo) => void;
}

const columns = [
  { id: 'todo' as const, label: 'Todo', color: 'var(--color-priority-medium)' },
  { id: 'in_progress' as const, label: 'In Progress', color: 'var(--accent)' },
  { id: 'done' as const, label: 'Done', color: 'var(--color-buy)' },
];

export default function TodoKanban({ todos, onEdit }: TodoKanbanProps) {
  const updateTodo = useUpdateTodo();

  const handleDrop = (e: React.DragEvent, status: Todo['status']) => {
    e.preventDefault();
    const todoId = e.dataTransfer.getData('todoId');
    if (todoId) {
      updateTodo.mutate({ id: todoId, status });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragStart = (e: React.DragEvent, todoId: string) => {
    e.dataTransfer.setData('todoId', todoId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map((col) => {
        const items = todos.filter((t) => t.status === col.id);
        return (
          <div
            key={col.id}
            onDrop={(e) => handleDrop(e, col.id)}
            onDragOver={handleDragOver}
            className="bg-[var(--bg)] rounded-2xl p-4 min-h-[300px]"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">{col.label}</h3>
              <span className="text-xs text-[var(--text-secondary)] ml-auto">{items.length}</span>
            </div>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {items.map((todo) => (
                  <div
                    key={todo.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, todo.id)}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <TodoItem todo={todo} compact onEdit={onEdit} />
                  </div>
                ))}
              </AnimatePresence>
              {items.length === 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-[var(--text-secondary)] text-center py-8"
                >
                  Drop items here
                </motion.p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
