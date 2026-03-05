import { useState } from 'react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { useCreateDecision } from '@/hooks/useDecisions';
import type { Decision } from '@/types';

interface DecisionFormProps {
  stockId: string;
  onClose: () => void;
}

export default function DecisionForm({ stockId, onClose }: DecisionFormProps) {
  const [status, setStatus] = useState<Decision['status']>('watching');
  const [reasoning, setReasoning] = useState('');
  const createDecision = useCreateDecision();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDecision.mutate(
      {
        stockId,
        status,
        reasoning: reasoning || null,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Decision Status"
        value={status}
        onChange={(e) => setStatus(e.target.value as Decision['status'])}
        options={[
          { value: 'researching', label: 'Researching' },
          { value: 'considering', label: 'Considering' },
          { value: 'bought', label: 'Bought' },
          { value: 'passed', label: 'Passed' },
          { value: 'sold', label: 'Sold' },
          { value: 'watching', label: 'Watching' },
        ]}
      />
      <Textarea
        label="Reasoning"
        value={reasoning}
        onChange={(e) => setReasoning(e.target.value)}
        placeholder="Reasoning for this decision..."
        rows={4}
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={createDecision.isPending}>
          Record Decision
        </Button>
      </div>
    </form>
  );
}
