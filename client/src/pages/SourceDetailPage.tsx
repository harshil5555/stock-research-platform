import { useParams, Link } from 'react-router-dom';
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
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import FileUpload from '@/components/sources/FileUpload';
import SourceLinker from '@/components/sources/SourceLinker';
import CommentThread from '@/components/comments/CommentThread';
import api from '@/lib/api';
import { useSource, useUnlinkStock } from '@/hooks/useSources';
import { useTodos } from '@/hooks/useTodos';
import { useUIStore } from '@/stores/uiStore';
import { formatDate, sourceTypeLabels, priorityColors } from '@/lib/utils';

function downloadAttachment(sourceId: string, attachmentId: string, filename: string) {
  api.get(`/sources/${sourceId}/attachments/${attachmentId}`, { responseType: 'blob' })
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
  const { data: linkedTodos } = useTodos({ sourceId: id });
  const unlinkStock = useUnlinkStock();

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
                <Badge>{sourceTypeLabels[source.type] || source.type}</Badge>
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
              </div>
              {source.summary && (
                <p className="text-sm text-[var(--text-secondary)] mb-3">{source.summary}</p>
              )}
              <p className="text-xs text-[var(--text-secondary)]">
                Added {formatDate(source.createdAt)}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {source.content && (
        <Card>
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Content</h2>
          <div className="text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
            {source.content}
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
                    {(att.size / 1024).toFixed(1)}KB
                  </span>
                  <button
                    onClick={() => downloadAttachment(source.id, att.id, att.originalName)}
                    aria-label="Download attachment"
                    className="text-[var(--accent)] hover:text-[var(--accent)] transition-colors"
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
                    <span className="text-sm text-[var(--text-primary)] truncate">{stock.name}</span>
                  </Link>
                  <button
                    onClick={() => unlinkStock.mutate({ sourceId: source.id, stockId: stock.id })}
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
            linkedStockIds={(source.stocks || []).map((s) => s.id)}
          />
        </Card>
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <CheckSquare size={16} />
          Linked Todos
          {linkedTodos && linkedTodos.length > 0 && (
            <span className="text-xs text-[var(--text-secondary)] font-normal">({linkedTodos.length})</span>
          )}
        </h2>
        {linkedTodos && linkedTodos.length > 0 ? (
          <div className="space-y-2">
            {linkedTodos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-[var(--hover)]"
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${todo.status === 'done' ? 'bg-[var(--color-buy)]' : todo.status === 'in_progress' ? 'bg-[var(--accent)]' : 'bg-[var(--color-priority-medium)]'}`} />
                <span className={`text-sm text-[var(--text-primary)] flex-1 truncate ${todo.status === 'done' ? 'line-through opacity-60' : ''}`}>
                  {todo.title}
                </span>
                <Badge variant={priorityColors[todo.priority]} className="shrink-0">
                  {todo.priority}
                </Badge>
                <span className="text-xs text-[var(--text-secondary)] capitalize shrink-0">
                  {todo.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[var(--text-secondary)] text-center py-4">
            No linked todos
          </p>
        )}
      </Card>

      <Card>
        <CommentThread sourceId={source.id} />
      </Card>
    </div>
  );
}
