import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TodoItem from './TodoItem';
import { useUpdateTodoStatus, useReorderTodos } from '@/hooks/useTodos';
import type { Todo } from '@/types';

interface TodoKanbanProps {
  todos: Todo[];
  onEdit?: (todo: Todo) => void;
  activeFilter?: string;
}

const columns = [
  { id: 'pending' as const, label: 'Pending', color: 'var(--color-priority-medium)' },
  { id: 'in_progress' as const, label: 'In Progress', color: 'var(--accent)' },
  { id: 'done' as const, label: 'Done', color: 'var(--color-buy)' },
];

export default function TodoKanban({ todos, onEdit, activeFilter }: TodoKanbanProps) {
  const updateTodoStatus = useUpdateTodoStatus();
  const reorderTodos = useReorderTodos();
  const visibleColumns = activeFilter ? columns.filter(c => c.id === activeFilter) : columns;
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragItemRef = useRef<{ id: string; status: string } | null>(null);

  const handleDragStart = (e: React.DragEvent, todo: Todo) => {
    e.dataTransfer.setData('todoId', todo.id);
    e.dataTransfer.setData('todoStatus', todo.status);
    dragItemRef.current = { id: todo.id, status: todo.status };
  };

  const handleDragOver = (e: React.DragEvent, targetTodoId?: string) => {
    e.preventDefault();
    if (targetTodoId && targetTodoId !== dragItemRef.current?.id) {
      setDragOverId(targetTodoId);
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, columnStatus: Todo['status']) => {
    e.preventDefault();
    setDragOverId(null);
    const todoId = e.dataTransfer.getData('todoId');
    const fromStatus = e.dataTransfer.getData('todoStatus');
    if (!todoId) return;

    const targetTodoId = dragOverId || e.currentTarget.getAttribute('data-drop-target');

    if (fromStatus === columnStatus && targetTodoId) {
      // Reorder within same column
      const columnItems = [...todos.filter(t => t.status === columnStatus)]
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

      const dragIndex = columnItems.findIndex(t => t.id === todoId);
      const dropIndex = columnItems.findIndex(t => t.id === targetTodoId);

      if (dragIndex !== -1 && dropIndex !== -1 && dragIndex !== dropIndex) {
        const [moved] = columnItems.splice(dragIndex, 1);
        columnItems.splice(dropIndex, 0, moved);

        const items = columnItems.map((t, i) => ({ id: t.id, sortOrder: i }));
        reorderTodos.mutate(items);
      }
    } else if (fromStatus !== columnStatus) {
      // Move to different column (change status)
      updateTodoStatus.mutate({ id: todoId, status: columnStatus });
    }

    dragItemRef.current = null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {visibleColumns.map((col) => {
        const items = todos
          .filter((t) => t.status === col.id)
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        return (
          <div
            key={col.id}
            data-drop-target=""
            onDrop={(e) => handleDrop(e, col.id)}
            onDragOver={(e) => handleDragOver(e)}
            onDragLeave={handleDragLeave}
            className="bg-[var(--bg)] rounded-2xl p-4 min-h-[300px]"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">{col.label}</h3>
              <span className="text-xs text-[var(--text-secondary)] ml-auto">{items.length}</span>
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {items.map((todo) => (
                  <div
                    key={todo.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, todo)}
                    onDragOver={(e) => handleDragOver(e, todo.id)}
                    className={`cursor-grab active:cursor-grabbing transition-all ${
                      dragOverId === todo.id ? 'border-t-2 border-[var(--accent)] pt-1' : ''
                    }`}
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
