import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Pencil, Trash2, FileText, CheckSquare, TrendingUp, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import StockDetailHeader from '@/components/stocks/StockDetail';
import StockForm from '@/components/stocks/StockForm';
import AnalysisView from '@/components/analysis/AnalysisView';
import AnalysisEditor from '@/components/analysis/AnalysisEditor';
import CommentThread from '@/components/comments/CommentThread';
import DecisionForm from '@/components/decisions/DecisionForm';
import DecisionHistory from '@/components/decisions/DecisionHistory';
import { useStock, useStockAnalyses, useDeleteStock, useLinkSourceToStock, useUnlinkSourceFromStock, useLinkTodoToStock, useUnlinkTodoFromStock } from '@/hooks/useStocks';
import { useSources } from '@/hooks/useSources';
import { useTodos } from '@/hooks/useTodos';
import { useDecisions } from '@/hooks/useDecisions';

export default function StockDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: stock, isLoading } = useStock(id ?? '');
  const { data: analyses } = useStockAnalyses(id ?? '');
  const { data: decisions } = useDecisions(id ?? '');
  const deleteStock = useDeleteStock();
  const linkSource = useLinkSourceToStock();
  const unlinkSource = useUnlinkSourceFromStock();
  const linkTodo = useLinkTodoToStock();
  const unlinkTodo = useUnlinkTodoFromStock();
  const { data: allSources } = useSources();
  const { data: allTodos } = useTodos();
  const navigate = useNavigate();
  const [tab, setTab] = useState('analysis');
  const [showAnalysisForm, setShowAnalysisForm] = useState(false);
  const [showDecisionForm, setShowDecisionForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedTodo, setSelectedTodo] = useState('');

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!stock) {
    return <p className="text-[var(--text-secondary)]">Stock not found</p>;
  }

  const tabs = [
    { id: 'analysis', label: 'Analysis', count: analyses?.length },
    { id: 'discussion', label: 'Discussion' },
    { id: 'decisions', label: 'Decisions', count: decisions?.length },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <Link
          to="/stocks"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Stocks
        </Link>
        <div className="flex gap-1">
          <button
            onClick={() => setShowEditForm(true)}
            aria-label="Edit stock"
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--hover)] transition-all"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => {
              if (window.confirm('Delete this stock? This cannot be undone.')) {
                deleteStock.mutate(stock.id, { onSuccess: () => navigate('/stocks') });
              }
            }}
            aria-label="Delete stock"
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--color-sell)] hover:bg-[var(--hover)] transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <StockDetailHeader stock={stock} />
      </motion.div>

      {(() => {
        const linkedSourceIds = (stock.sources || []).map((s: any) => s.id);
        const linkedTodoIds = (stock.todos || []).map((t: any) => t.id);
        const availableSources = (allSources || []).filter((s) => !linkedSourceIds.includes(s.id));
        const availableTodos = (allTodos || []).filter((t) => !linkedTodoIds.includes(t.id));

        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <FileText size={16} />
                Linked Sources
                {stock.sources && stock.sources.length > 0 && (
                  <span className="text-xs text-[var(--text-secondary)] font-normal">({stock.sources.length})</span>
                )}
              </h2>
              {stock.sources && stock.sources.length > 0 && (
                <div className="space-y-2 mb-4">
                  {stock.sources.map((source: any) => (
                    <div
                      key={source.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-[var(--hover)] group"
                    >
                      <Link
                        to={`/sources/${source.id}`}
                        className="flex items-center gap-2 flex-1 min-w-0 hover:opacity-80 transition-opacity"
                      >
                        <FileText size={14} className="text-[var(--accent)] shrink-0" />
                        <span className="text-sm text-[var(--text-primary)] truncate">{source.title}</span>
                      </Link>
                      <button
                        onClick={() => unlinkSource.mutate({ stockId: stock.id, sourceId: source.id })}
                        aria-label={`Unlink ${source.title}`}
                        className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--color-sell)] hover:bg-[var(--border)] opacity-0 group-hover:opacity-100 transition-all shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    options={[
                      { value: '', label: 'Select a source...' },
                      ...availableSources.map((s) => ({ value: s.id, label: s.title })),
                    ]}
                  />
                </div>
                <Button
                  size="sm"
                  disabled={!selectedSource}
                  onClick={() => {
                    if (selectedSource) {
                      linkSource.mutate({ stockId: stock.id, sourceId: selectedSource });
                      setSelectedSource('');
                    }
                  }}
                >
                  Link
                </Button>
              </div>
            </Card>

            <Card>
              <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <CheckSquare size={16} />
                Linked Todos
                {stock.todos && stock.todos.length > 0 && (
                  <span className="text-xs text-[var(--text-secondary)] font-normal">({stock.todos.length})</span>
                )}
              </h2>
              {stock.todos && stock.todos.length > 0 && (
                <div className="space-y-2 mb-4">
                  {stock.todos.map((todo: any) => (
                    <div
                      key={todo.id}
                      className="flex items-center gap-3 p-2 rounded-lg bg-[var(--hover)] group"
                    >
                      <div className={`w-2 h-2 rounded-full shrink-0 ${todo.status === 'done' ? 'bg-[var(--color-buy)]' : todo.status === 'in_progress' ? 'bg-[var(--accent)]' : 'bg-[var(--color-priority-medium)]'}`} />
                      <Link
                        to={`/todos/${todo.id}`}
                        className="flex-1 min-w-0 hover:opacity-80 transition-opacity"
                      >
                        <span className={`text-sm text-[var(--text-primary)] truncate ${todo.status === 'done' ? 'line-through opacity-60' : ''}`}>
                          {todo.title}
                        </span>
                      </Link>
                      <span className="text-xs text-[var(--text-secondary)] capitalize shrink-0">
                        {todo.status.replace('_', ' ')}
                      </span>
                      <button
                        onClick={() => unlinkTodo.mutate({ stockId: stock.id, todoId: todo.id })}
                        aria-label={`Unlink ${todo.title}`}
                        className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--color-sell)] hover:bg-[var(--border)] opacity-0 group-hover:opacity-100 transition-all shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select
                    value={selectedTodo}
                    onChange={(e) => setSelectedTodo(e.target.value)}
                    options={[
                      { value: '', label: 'Select a todo...' },
                      ...availableTodos.map((t) => ({ value: t.id, label: t.title })),
                    ]}
                  />
                </div>
                <Button
                  size="sm"
                  disabled={!selectedTodo}
                  onClick={() => {
                    if (selectedTodo) {
                      linkTodo.mutate({ stockId: stock.id, todoId: selectedTodo });
                      setSelectedTodo('');
                    }
                  }}
                >
                  Link
                </Button>
              </div>
            </Card>
          </div>
        );
      })()}

      <div className="flex items-center justify-between gap-4">
        <Tabs tabs={tabs} active={tab} onChange={setTab} />
        <div className="flex gap-2">
          {tab === 'analysis' && (
            <Button size="sm" onClick={() => setShowAnalysisForm(true)}>
              <Plus size={14} />
              Write Analysis
            </Button>
          )}
          {tab === 'decisions' && (
            <Button size="sm" onClick={() => setShowDecisionForm(true)}>
              <Plus size={14} />
              New Decision
            </Button>
          )}
        </div>
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
      >
        {tab === 'analysis' && <AnalysisView analyses={analyses || []} />}

        {tab === 'discussion' && <CommentThread stockId={stock.id} />}

        {tab === 'decisions' && <DecisionHistory decisions={decisions || []} />}
      </motion.div>

      <Modal open={showAnalysisForm} onClose={() => setShowAnalysisForm(false)} title="Write Analysis" className="max-w-2xl">
        <AnalysisEditor stockId={stock.id} onClose={() => setShowAnalysisForm(false)} />
      </Modal>

      <Modal open={showDecisionForm} onClose={() => setShowDecisionForm(false)} title="Record Decision">
        <DecisionForm stockId={stock.id} onClose={() => setShowDecisionForm(false)} />
      </Modal>

      <Modal open={showEditForm} onClose={() => setShowEditForm(false)} title="Edit Stock">
        <StockForm stock={stock} onClose={() => setShowEditForm(false)} />
      </Modal>
    </div>
  );
}
