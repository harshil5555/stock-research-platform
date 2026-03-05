import { useState } from 'react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { useCreateDecision } from '@/hooks/useDecisions';
import type { Decision } from '@/types';

interface DecisionFormProps {
  stockId: string;
  onClose: () => void;
}

export default function DecisionForm({ stockId, onClose }: DecisionFormProps) {
  const [decision, setDecision] = useState('watching');
  const [targetPrice, setTargetPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [confidence, setConfidence] = useState('50');
  const createDecision = useCreateDecision();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDecision.mutate(
      {
        stockId,
        decision: decision as Decision['decision'],
        targetPrice: targetPrice ? parseFloat(targetPrice) : null,
        notes: notes || null,
        confidence: confidence ? parseInt(confidence) : null,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Decision"
        value={decision}
        onChange={(e) => setDecision(e.target.value)}
        options={[
          { value: 'buy', label: 'Buy' },
          { value: 'sell', label: 'Sell' },
          { value: 'hold', label: 'Hold' },
          { value: 'watching', label: 'Watching' },
          { value: 'none', label: 'None' },
        ]}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Target Price"
          value={targetPrice}
          onChange={(e) => setTargetPrice(e.target.value)}
          placeholder="0.00"
          type="number"
          step="0.01"
        />
        <Input
          label="Confidence (%)"
          value={confidence}
          onChange={(e) => setConfidence(e.target.value)}
          placeholder="0-100"
          type="number"
          min="0"
          max="100"
        />
      </div>
      <Textarea
        label="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
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
