import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Paperclip,
  Download,
  TrendingUp,
  CheckSquare,
  X,
  Pencil,
  Trash2,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import FileUpload from '@/components/sources/FileUpload';
import SourceForm from '@/components/sources/SourceForm';
import SourceLinker from '@/components/sources/SourceLinker';
import TodoLinker from '@/components/sources/TodoLinker';
import CommentThread from '@/components/comments/CommentThread';
import api from '@/lib/api';
import { useSource, useUnlinkStock, useUnlinkTodo, useDeleteSource } from '@/hooks/useSources';
import { useUIStore } from '@/stores/uiStore';
import { formatDate, sourceTypeLabels } from '@/lib/utils';

function downloadAttachment(attachmentId: string, filename: string) {
  api.get(`/attachments/${attachmentId}/download`, { responseType: 'blob' })
    .then((res) => {
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    })
    .catch(() => {
      useUIStore.getState().addToast({ type: 'error', message: 'Download failed' });
    });
}

export default function SourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: source, isLoading } = useSource(id ?? '');
  const unlinkStock = useUnlinkStock();
  const unlinkTodo = useUnlinkTodo();
  const deleteSource = useDeleteSource();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!source) {
    return <p className="text-[var(--text-secondary)]">Source not found</p>;
  }

  const currentStockIds = (source.stocks || []).map((s) => s.id);
  const currentTodoIds = (source.todos || []).map((t) => t.id);

  return (
    <div className="space-y-6 max-w-4xl">
      <Link
        to="/sources"
        className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Sources
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-[var(--hover)]">
              <FileText size={24} className="text-[var(--accent)]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl font-bold text-[var(--text-primary)]">{source.title}</h1>
                <Badge>{sourceTypeLabels[source.sourceType] || source.sourceType}</Badge>
                {source.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--accent)] hover:underline text-sm flex items-center gap-1"
                  >
                    <ExternalLink size={14} />
                    Visit
                  </a>
                )}
                <div className="ml-auto flex gap-1">
                  <button
                    onClick={() => setShowEditModal(true)}
                    aria-label="Edit source"
                    className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--hover)] transition-all"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this source? This cannot be undone.')) {
                        deleteSource.mutate(source.id, { onSuccess: () => navigate('/sources') });
                      }
                    }}
                    aria-label="Delete source"
                    className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--color-sell)] hover:bg-[var(--hover)] transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {source.summary && (
                <p className="text-sm text-[var(--text-primary)] mb-3">{source.summary}</p>
              )}
              <p className="text-xs text-[var(--text-secondary)]">
                Added {formatDate(source.createdAt)}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {source.notes && (
        <Card>
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Notes</h2>
          <div className="text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
            {source.notes}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Paperclip size={16} />
            Attachments
          </h2>
          {source.attachments && source.attachments.length > 0 && (
            <div className="space-y-2 mb-4">
              {source.attachments.map((att) => (
                <div key={att.id} className="flex items-center gap-3 p-2 rounded-lg bg-[var(--hover)]">
                  <FileText size={14} className="text-[var(--text-secondary)]" />
                  <span className="text-sm text-[var(--text-primary)] flex-1 truncate">
                    {att.originalName}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {(att.sizeBytes / 1024).toFixed(1)}KB
                  </span>
                  <button
                    onClick={() => downloadAttachment(att.id, att.originalName)}
                    aria-label="Download attachment"
                    className="text-[var(--accent)] hover:brightness-125 transition-all"
                  >
                    <Download size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <FileUpload sourceId={source.id} />
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <TrendingUp size={16} />
            Linked Stocks
          </h2>
          {source.stocks && source.stocks.length > 0 && (
            <div className="space-y-2 mb-4">
              {source.stocks.map((stock) => (
                <div
                  key={stock.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[var(--hover)] group"
                >
                  <Link
                    to={`/stocks/${stock.id}`}
                    className="flex items-center gap-2 flex-1 min-w-0 hover:opacity-80 transition-opacity"
                  >
                    <span className="text-sm font-bold text-[var(--accent)]">{stock.ticker}</span>
                    <span className="text-sm text-[var(--text-primary)] truncate">{stock.companyName}</span>
                  </Link>
                  <button
                    onClick={() => {
                      const remaining = currentStockIds.filter((sid) => sid !== stock.id);
                      unlinkStock.mutate({ sourceId: source.id, stockIds: remaining });
                    }}
                    aria-label={`Unlink ${stock.ticker}`}
                    className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--color-sell)] hover:bg-[var(--border)] opacity-0 group-hover:opacity-100 transition-all shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <SourceLinker
            sourceId={source.id}
            linkedStockIds={currentStockIds}
          />
        </Card>
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <CheckSquare size={16} />
          Linked Todos
          {source.todos && source.todos.length > 0 && (
            <span className="text-xs text-[var(--text-secondary)] font-normal">({source.todos.length})</span>
          )}
        </h2>
        {source.todos && source.todos.length > 0 && (
          <div className="space-y-2 mb-4">
            {source.todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-[var(--hover)] group"
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${todo.status === 'done' ? 'bg-[var(--color-buy)]' : todo.status === 'in_progress' ? 'bg-[var(--accent)]' : 'bg-[var(--color-priority-medium)]'}`} />
                <span className={`text-sm text-[var(--text-primary)] flex-1 truncate ${todo.status === 'done' ? 'line-through opacity-60' : ''}`}>
                  {todo.title}
                </span>
                <span className="text-xs text-[var(--text-secondary)] capitalize shrink-0">
                  {todo.status.replace('_', ' ')}
                </span>
                <button
                  onClick={() => unlinkTodo.mutate({ sourceId: source.id, todoId: todo.id })}
                  aria-label={`Unlink ${todo.title}`}
                  className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--color-sell)] hover:bg-[var(--border)] opacity-0 group-hover:opacity-100 transition-all shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        <TodoLinker sourceId={source.id} linkedTodoIds={currentTodoIds} />
      </Card>

      <Card>
        <CommentThread sourceId={source.id} />
      </Card>

      <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Source">
        <SourceForm source={source} onClose={() => setShowEditModal(false)} />
      </Modal>
    </div>
  );
}
