import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { useCreateStock } from '@/hooks/useStocks';

interface StockFormProps {
  onClose: () => void;
}

export default function StockForm({ onClose }: StockFormProps) {
  const [ticker, setTicker] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [sector, setSector] = useState('');
  const [notes, setNotes] = useState('');
  const createStock = useCreateStock();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createStock.mutate(
      {
        ticker: ticker.toUpperCase(),
        companyName,
        sector: sector || null,
        notes: notes || null,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Ticker"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="AAPL"
          required
        />
        <Input
          label="Sector"
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          placeholder="Technology"
        />
      </div>
      <Input
        label="Company Name"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        placeholder="Apple Inc."
        required
      />
      <Textarea
        label="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes about this stock..."
        rows={3}
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={createStock.isPending}>
          Add Stock
        </Button>
      </div>
    </form>
  );
}
