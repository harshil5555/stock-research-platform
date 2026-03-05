import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { useCreateSource } from '@/hooks/useSources';
import type { Source } from '@/types';

interface SourceFormProps {
  onClose: () => void;
}

export default function SourceForm({ onClose }: SourceFormProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState('article');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const createSource = useCreateSource();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSource.mutate(
      {
        title,
        url: url || null,
        type: type as Source['type'],
        summary: summary || null,
        content: content || null,
      },
      { onSuccess: onClose }
    );
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
        type="url"
      />
      <Select
        label="Type"
        value={type}
        onChange={(e) => setType(e.target.value)}
        options={[
          { value: 'article', label: 'Article' },
          { value: 'report', label: 'Report' },
          { value: 'filing', label: 'Filing' },
          { value: 'news', label: 'News' },
          { value: 'analysis', label: 'Analysis' },
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
        label="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Full content or notes..."
        rows={5}
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={createSource.isPending}>
          Add Source
        </Button>
      </div>
    </form>
  );
}
