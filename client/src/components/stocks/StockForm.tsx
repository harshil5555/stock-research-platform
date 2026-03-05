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
  const [name, setName] = useState('');
  const [sector, setSector] = useState('');
  const [description, setDescription] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const createStock = useCreateStock();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createStock.mutate(
      {
        ticker: ticker.toUpperCase(),
        name,
        sector: sector || null,
        description: description || null,
        currentPrice: currentPrice ? parseFloat(currentPrice) : null,
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
          label="Current Price"
          value={currentPrice}
          onChange={(e) => setCurrentPrice(e.target.value)}
          placeholder="0.00"
          type="number"
          step="0.01"
        />
      </div>
      <Input
        label="Company Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Apple Inc."
        required
      />
      <Input
        label="Sector"
        value={sector}
        onChange={(e) => setSector(e.target.value)}
        placeholder="Technology"
      />
      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Company description..."
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
