import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LayoutGrid, List } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { CardSkeleton } from '@/components/ui/Skeleton';
import TodoItem from '@/components/todos/TodoItem';
import TodoForm from '@/components/todos/TodoForm';
import TodoFilters from '@/components/todos/TodoFilters';
import TodoKanban from '@/components/todos/TodoKanban';
import { useTodos } from '@/hooks/useTodos';
import type { Todo } from '@/types';

export default function TodosPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>();
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: todos, isLoading } = useTodos({
    status: statusFilter || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Todos</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Track your research tasks
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} />
          New Todo
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <TodoFilters
          status={statusFilter}
          onStatusChange={setStatusFilter}
        />
        <div className="flex gap-1 p-1 bg-[var(--hover)] rounded-xl">
          <button
            onClick={() => setView('kanban')}
            aria-label="Kanban view"
            className={`p-2 rounded-lg transition-colors ${view === 'kanban' ? 'bg-[var(--surface)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setView('list')}
            aria-label="List view"
            className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-[var(--surface)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : view === 'kanban' ? (
        <TodoKanban todos={todos || []} onEdit={(todo) => { setEditingTodo(todo); setShowForm(true); }} />
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {(todos || []).map((todo) => (
              <TodoItem key={todo.id} todo={todo} onEdit={(t) => { setEditingTodo(t); setShowForm(true); }} />
            ))}
          </AnimatePresence>
          {todos?.length === 0 && (
            <div className="text-center py-12 text-[var(--text-secondary)]">
              <p className="text-sm">No todos found. Create one to get started.</p>
            </div>
          )}
        </div>
      )}

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditingTodo(undefined); }} title={editingTodo ? 'Edit Todo' : 'New Todo'}>
        <TodoForm todo={editingTodo} onClose={() => { setShowForm(false); setEditingTodo(undefined); }} />
      </Modal>
    </div>
  );
}
