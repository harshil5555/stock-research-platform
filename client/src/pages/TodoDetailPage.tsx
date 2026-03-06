import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckSquare,
  FileText,
  TrendingUp,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import TodoForm from '@/components/todos/TodoForm';
import CommentThread from '@/components/comments/CommentThread';
import {
  useTodo,
  useDeleteTodo,
  useUnlinkStockFromTodo,
  useUnlinkSourceFromTodo,
  useLinkStockToTodo,
  useLinkSourceToTodo,
} from '@/hooks/useTodos';
import { useStocks } from '@/hooks/useStocks';
import { useSources } from '@/hooks/useSources';
import { formatDate, priorityLabel } from '@/lib/utils';

export default function TodoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: todo, isLoading } = useTodo(id ?? '');
  const deleteTodo = useDeleteTodo();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);

  // Linking
  const unlinkStock = useUnlinkStockFromTodo();
  const unlinkSource = useUnlinkSourceFromTodo();
  const linkStock = useLinkStockToTodo();
  const linkSource = useLinkSourceToTodo();
  const { data: allStocks } = useStocks();
  const { data: allSources } = useSources();
  const [selectedStock, setSelectedStock] = useState('');
  const [selectedSource, setSelectedSource] = useState('');

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!todo) {
    return <p className="text-[var(--text-secondary)]">Todo not found</p>;
  }

  const linkedStockIds = (todo.stocks || []).map((s) => s.id);
  const linkedSourceIds = (todo.sources || []).map((s) => s.id);
  const availableStocks = (allStocks || []).filter((s) => !linkedStockIds.includes(s.id));
  const availableSources = (allSources || []).filter((s) => !linkedSourceIds.includes(s.id));

  const statusColor =
    todo.status === 'done'
      ? 'var(--color-buy)'
      : todo.status === 'in_progress'
        ? 'var(--accent)'
        : 'var(--color-priority-medium)';

  return (
    <div className="space-y-6 max-w-4xl">
      <Link
        to="/todos"
        className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Todos
      </Link>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-[var(--hover)]">
              <CheckSquare size={24} className="text-[var(--accent)]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl font-bold text-[var(--text-primary)]">{todo.title}</h1>
                <Badge>
                  P{todo.priority} {priorityLabel(todo.priority)}
                </Badge>
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: statusColor }}
                />
                <span className="text-sm text-[var(--text-secondary)] capitalize">
                  {todo.status.replace('_', ' ')}
                </span>
                <div className="ml-auto flex gap-1">
                  <button
                    onClick={() => setShowEditModal(true)}
                    aria-label="Edit todo"
                    className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--hover)] transition-all"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this todo? This cannot be undone.')) {
                        deleteTodo.mutate(todo.id, {
                          onSuccess: () => navigate('/todos'),
                        });
                      }
                    }}
                    aria-label="Delete todo"
                    className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--color-sell)] hover:bg-[var(--hover)] transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {todo.description && (
                <p className="text-sm text-[var(--text-primary)] mb-3">{todo.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
                <span>Created {formatDate(todo.createdAt)}</span>
                {todo.dueDate && <span>Due {formatDate(todo.dueDate)}</span>}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Linked Sources */}
        <Card>
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <FileText size={16} />
            Linked Sources
            {todo.sources && todo.sources.length > 0 && (
              <span className="text-xs text-[var(--text-secondary)] font-normal">
                ({todo.sources.length})
              </span>
            )}
          </h2>
          {todo.sources && todo.sources.length > 0 && (
            <div className="space-y-2 mb-4">
              {todo.sources.map((source) => (
                <div
                  key={source.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[var(--hover)] group"
                >
                  <Link
                    to={`/sources/${source.id}`}
                    className="flex items-center gap-2 flex-1 min-w-0 hover:opacity-80 transition-opacity"
                  >
                    <span className="text-sm font-bold text-[var(--accent)]">
                      {source.sourceType}
                    </span>
                    <span className="text-sm text-[var(--text-primary)] truncate">
                      {source.title}
                    </span>
                  </Link>
                  <button
                    onClick={() =>
                      unlinkSource.mutate({ todoId: todo.id, sourceId: source.id })
                    }
                    aria-label={`Unlink ${source.title}`}
                    className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--color-sell)] hover:bg-[var(--border)] opacity-0 group-hover:opacity-100 transition-all shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {availableSources.length > 0 ? (
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Select
                  label="Link Source"
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  options={[
                    { value: '', label: 'Select a source...' },
                    ...availableSources.map((s) => ({ value: s.id, label: s.title })),
                  ]}
                />
              </div>
              <button
                disabled={!selectedSource}
                onClick={() => {
                  linkSource.mutate(
                    { todoId: todo.id, sourceId: selectedSource },
                    { onSuccess: () => setSelectedSource('') }
                  );
                }}
                className="px-3 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-medium disabled:opacity-50 hover:brightness-110 transition-all"
              >
                Link
              </button>
            </div>
          ) : (
            <p className="text-xs text-[var(--text-secondary)]">No sources available to link</p>
          )}
        </Card>

        {/* Linked Stocks */}
        <Card>
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <TrendingUp size={16} />
            Linked Stocks
            {todo.stocks && todo.stocks.length > 0 && (
              <span className="text-xs text-[var(--text-secondary)] font-normal">
                ({todo.stocks.length})
              </span>
            )}
          </h2>
          {todo.stocks && todo.stocks.length > 0 && (
            <div className="space-y-2 mb-4">
              {todo.stocks.map((stock) => (
                <div
                  key={stock.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[var(--hover)] group"
                >
                  <Link
                    to={`/stocks/${stock.id}`}
                    className="flex items-center gap-2 flex-1 min-w-0 hover:opacity-80 transition-opacity"
                  >
                    <span className="text-sm font-bold text-[var(--accent)]">
                      {stock.ticker}
                    </span>
                    <span className="text-sm text-[var(--text-primary)] truncate">
                      {stock.companyName}
                    </span>
                  </Link>
                  <button
                    onClick={() =>
                      unlinkStock.mutate({ todoId: todo.id, stockId: stock.id })
                    }
                    aria-label={`Unlink ${stock.ticker}`}
                    className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--color-sell)] hover:bg-[var(--border)] opacity-0 group-hover:opacity-100 transition-all shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {availableStocks.length > 0 ? (
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Select
                  label="Link Stock"
                  value={selectedStock}
                  onChange={(e) => setSelectedStock(e.target.value)}
                  options={[
                    { value: '', label: 'Select a stock...' },
                    ...availableStocks.map((s) => ({
                      value: s.id,
                      label: `${s.ticker} - ${s.companyName}`,
                    })),
                  ]}
                />
              </div>
              <button
                disabled={!selectedStock}
                onClick={() => {
                  linkStock.mutate(
                    { todoId: todo.id, stockId: selectedStock },
                    { onSuccess: () => setSelectedStock('') }
                  );
                }}
                className="px-3 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-medium disabled:opacity-50 hover:brightness-110 transition-all"
              >
                Link
              </button>
            </div>
          ) : (
            <p className="text-xs text-[var(--text-secondary)]">No stocks available to link</p>
          )}
        </Card>
      </div>

      {/* Comments */}
      <Card>
        <CommentThread todoId={todo.id} />
      </Card>

      <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Todo">
        <TodoForm todo={todo} onClose={() => setShowEditModal(false)} />
      </Modal>
    </div>
  );
}
