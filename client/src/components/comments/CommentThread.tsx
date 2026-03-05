import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Reply } from 'lucide-react';
import CommentForm from './CommentForm';
import Skeleton from '@/components/ui/Skeleton';
import { formatRelative } from '@/lib/utils';
import { useComments } from '@/hooks/useComments';
import type { Comment } from '@/types';

interface CommentThreadProps {
  sourceId?: string;
  stockId?: string;
}

function CommentItem({ comment, sourceId, stockId, depth = 0 }: {
  comment: Comment;
  sourceId?: string;
  stockId?: string;
  depth?: number;
}) {
  const [replying, setReplying] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
      style={{ marginLeft: depth * 24 }}
    >
      <div className="flex gap-3">
        <div className="w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-xs font-medium shrink-0">
          {comment.creator?.name?.charAt(0) || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {comment.creator?.name || 'Unknown'}
            </span>
            <span className="text-xs text-[var(--text-secondary)]">
              {formatRelative(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{comment.content}</p>
          <button
            onClick={() => setReplying(!replying)}
            className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] mt-1 transition-colors"
          >
            <Reply size={12} />
            Reply
          </button>
          {replying && (
            <div className="mt-2">
              <CommentForm
                sourceId={sourceId}
                stockId={stockId}
                parentId={comment.id}
                onSuccess={() => setReplying(false)}
              />
            </div>
          )}
        </div>
      </div>
      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          sourceId={sourceId}
          stockId={stockId}
          depth={depth + 1}
        />
      ))}
    </motion.div>
  );
}

export default function CommentThread({ sourceId, stockId }: CommentThreadProps) {
  const { data: comments, isLoading } = useComments({ sourceId, stockId });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle size={18} className="text-[var(--text-secondary)]" />
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          Discussion {comments ? `(${comments.length})` : ''}
        </h3>
      </div>
      <CommentForm sourceId={sourceId} stockId={stockId} />
      {isLoading ? (
        <div className="space-y-3 mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-7 h-7 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4 mt-4">
          {comments?.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              sourceId={sourceId}
              stockId={stockId}
            />
          ))}
          {comments?.length === 0 && (
            <p className="text-xs text-[var(--text-secondary)] text-center py-6">
              No comments yet. Start the discussion.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
