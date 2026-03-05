import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { useCreateStock, useUpdateStock } from '@/hooks/useStocks';
import type { Stock } from '@/types';

const SECTORS = [
  'Technology', 'Healthcare', 'Financials', 'Energy', 'Consumer Discretionary',
  'Consumer Staples', 'Industrials', 'Materials', 'Real Estate',
  'Communication Services', 'Utilities',
];

interface StockFormProps {
  onClose: () => void;
  stock?: Stock;
}

export default function StockForm({ onClose, stock }: StockFormProps) {
  const isEditing = !!stock;
  const [ticker, setTicker] = useState(stock?.ticker ?? '');
  const [companyName, setCompanyName] = useState(stock?.companyName ?? '');
  const [sector, setSector] = useState(stock?.sector ?? '');
  const [notes, setNotes] = useState(stock?.notes ?? '');
  const createStock = useCreateStock();
  const updateStock = useUpdateStock();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ticker: ticker.toUpperCase(),
      companyName,
      sector: sector || null,
      notes: notes || null,
    };
    if (isEditing) {
      updateStock.mutate({ id: stock.id, ...payload }, { onSuccess: onClose });
    } else {
      createStock.mutate(payload, { onSuccess: onClose });
    }
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
        <Select
          label="Sector"
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          options={[
            { value: '', label: 'Select sector...' },
            ...SECTORS.map((s) => ({ value: s, label: s })),
          ]}
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
        <Button type="submit" loading={isEditing ? updateStock.isPending : createStock.isPending}>
          {isEditing ? 'Save Changes' : 'Add Stock'}
        </Button>
      </div>
    </form>
  );
}
