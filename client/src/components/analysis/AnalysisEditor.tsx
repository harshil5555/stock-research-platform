import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { useCreateAnalysis } from '@/hooks/useStocks';

interface AnalysisEditorProps {
  stockId: string;
  onClose: () => void;
}

export default function AnalysisEditor({ stockId, onClose }: AnalysisEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const createAnalysis = useCreateAnalysis();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAnalysis.mutate({ stockId, title, content }, { onSuccess: onClose });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Analysis title..."
        required
      />
      <Textarea
        label="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your analysis here... Supports markdown."
        rows={12}
        required
      />
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={createAnalysis.isPending}>
          Save Analysis
        </Button>
      </div>
    </form>
  );
}
