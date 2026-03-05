import { useNavigate } from 'react-router-dom';
import { FileText, ExternalLink, Paperclip } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatRelative, sourceTypeLabels } from '@/lib/utils';
import type { Source } from '@/types';

interface SourceCardProps {
  source: Source;
}

export default function SourceCard({ source }: SourceCardProps) {
  const navigate = useNavigate();

  return (
    <Card hover onClick={() => navigate(`/sources/${source.id}`)}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-[var(--hover)]">
          <FileText size={18} className="text-[var(--accent)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {source.title}
            </h3>
            {source.url && (
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
          {source.summary && (
            <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-2">
              {source.summary}
            </p>
          )}
          <div className="flex items-center gap-2">
            <Badge>{sourceTypeLabels[source.type] || source.type}</Badge>
            {source.attachments && source.attachments.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                <Paperclip size={12} />
                {source.attachments.length}
              </span>
            )}
            <span className="text-xs text-[var(--text-secondary)] ml-auto">
              {formatRelative(source.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
