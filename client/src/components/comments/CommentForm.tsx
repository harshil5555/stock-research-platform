import { useState } from 'react';
import { Send } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useCreateComment } from '@/hooks/useComments';

interface CommentFormProps {
  sourceId?: string;
  stockId?: string;
  parentId?: string;
  onSuccess?: () => void;
}

export default function CommentForm({ sourceId, stockId, parentId, onSuccess }: CommentFormProps) {
  const [content, setContent] = useState('');
  const createComment = useCreateComment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    createComment.mutate(
      { content, sourceId, stockId, parentId },
      {
        onSuccess: () => {
          setContent('');
          onSuccess?.();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a comment..."
        className="flex-1 px-3.5 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
      />
      <Button type="submit" size="sm" loading={createComment.isPending} disabled={!content.trim()}>
        <Send size={14} />
      </Button>
    </form>
  );
}
