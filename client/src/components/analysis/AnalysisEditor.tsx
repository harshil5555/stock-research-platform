import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';
import Textarea from '@/components/ui/Textarea';
import { useUpsertAnalysis, useMyAnalysis } from '@/hooks/useStocks';

interface AnalysisEditorProps {
  stockId: string;
  onClose: () => void;
}

export default function AnalysisEditor({ stockId, onClose }: AnalysisEditorProps) {
  const { data: existing, isLoading } = useMyAnalysis(stockId);
  const [initialized, setInitialized] = useState(false);
  const [thesis, setThesis] = useState('');
  const [bullCase, setBullCase] = useState('');
  const [bearCase, setBearCase] = useState('');
  const [notes, setNotes] = useState('');
  const [targetPrice, setTargetPrice] = useState('');

  useEffect(() => {
    if (existing && !initialized) {
      setThesis(existing.thesis ?? '');
      setBullCase(existing.bullCase ?? '');
      setBearCase(existing.bearCase ?? '');
      setNotes(existing.notes ?? '');
      setTargetPrice(existing.targetPrice ?? '');
      setInitialized(true);
    }
  }, [existing, initialized]);
  const upsertAnalysis = useUpsertAnalysis();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertAnalysis.mutate({
      stockId,
      thesis: thesis || null,
      bullCase: bullCase || null,
      bearCase: bearCase || null,
      notes: notes || null,
      targetPrice: targetPrice || null,
    }, { onSuccess: onClose });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        label="Thesis"
        value={thesis}
        onChange={(e) => setThesis(e.target.value)}
        placeholder="Your investment thesis..."
        rows={4}
      />
      <div className="grid grid-cols-2 gap-4">
        <Textarea
          label="Bull Case"
          value={bullCase}
          onChange={(e) => setBullCase(e.target.value)}
          placeholder="Reasons to be optimistic..."
          rows={3}
        />
        <Textarea
          label="Bear Case"
          value={bearCase}
          onChange={(e) => setBearCase(e.target.value)}
          placeholder="Reasons to be cautious..."
          rows={3}
        />
      </div>
      <Input
        label="Target Price"
        value={targetPrice}
        onChange={(e) => setTargetPrice(e.target.value)}
        placeholder="e.g. $150"
      />
      <Textarea
        label="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Additional notes..."
        rows={3}
      />
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={upsertAnalysis.isPending}>
          Save Analysis
        </Button>
      </div>
    </form>
  );
}
