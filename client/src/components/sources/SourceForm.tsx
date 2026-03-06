import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { useCreateSource, useUpdateSource } from '@/hooks/useSources';
import { useUIStore } from '@/stores/uiStore';
import type { Source } from '@/types';

interface SourceFormProps {
  onClose: () => void;
  source?: Source;
}

export default function SourceForm({ onClose, source }: SourceFormProps) {
  const isEditing = !!source;
  const [title, setTitle] = useState(source?.title ?? '');
  const [url, setUrl] = useState(source?.url ?? '');
  const [sourceType, setSourceType] = useState<Source['sourceType']>(source?.sourceType ?? 'article');
  const [summary, setSummary] = useState(source?.summary ?? '');
  const [notes, setNotes] = useState(source?.notes ?? '');
  const createSource = useCreateSource();
  const updateSource = useUpdateSource();
  const addToast = useUIStore((s) => s.addToast);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && !/^https?:\/\/.+/i.test(url)) {
      addToast({ type: 'error', message: 'URL must start with http:// or https://' });
      return;
    }
    const payload = {
      title,
      url: url || null,
      sourceType,
      summary: summary || null,
      notes: notes || null,
    };
    if (isEditing) {
      updateSource.mutate({ id: source.id, ...payload }, { onSuccess: onClose });
    } else {
      createSource.mutate(payload, { onSuccess: onClose });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Source title"
        required
      />
      <Input
        label="URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://..."
        type="text"
      />
      <p className="text-xs text-[var(--text-secondary)] -mt-2">Include https:// for links</p>
      <Select
        label="Type"
        value={sourceType}
        onChange={(e) => setSourceType(e.target.value as Source['sourceType'])}
        options={[
          { value: 'article', label: 'Article' },
          { value: 'report', label: 'Report' },
          { value: 'video', label: 'Video' },
          { value: 'podcast', label: 'Podcast' },
          { value: 'tweet', label: 'Tweet' },
          { value: 'other', label: 'Other' },
        ]}
      />
      <Textarea
        label="Summary"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="Brief summary..."
        rows={2}
      />
      <Textarea
        label="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Full content or notes..."
        rows={5}
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={isEditing ? updateSource.isPending : createSource.isPending}>
          {isEditing ? 'Save Changes' : 'Add Source'}
        </Button>
      </div>
    </form>
  );
}
