import { useState } from 'react';
import { Send } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useCreateComment } from '@/hooks/useComments';

interface CommentFormProps {
  entityType: 'source' | 'stock' | 'todo';
  entityId: string;
  parentId?: string;
  onSuccess?: () => void;
}

export default function CommentForm({ entityType, entityId, parentId, onSuccess }: CommentFormProps) {
  const [body, setBody] = useState('');
  const createComment = useCreateComment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    createComment.mutate(
      { body, entityType, entityId, parentId },
      {
        onSuccess: () => {
          setBody('');
          onSuccess?.();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add a comment..."
        className="flex-1 px-3.5 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
      />
      <Button type="submit" size="sm" loading={createComment.isPending} disabled={!body.trim()}>
        <Send size={14} />
      </Button>
    </form>
  );
}
