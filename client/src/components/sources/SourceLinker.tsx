import { useState } from 'react';
import { Link as LinkIcon } from 'lucide-react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { useStocks } from '@/hooks/useStocks';
import { useLinkStock } from '@/hooks/useSources';

interface SourceLinkerProps {
  sourceId: string;
  linkedStockIds: string[];
}

export default function SourceLinker({ sourceId, linkedStockIds }: SourceLinkerProps) {
  const [selectedStock, setSelectedStock] = useState('');
  const { data: stocks } = useStocks();
  const linkStock = useLinkStock();

  const available = (stocks || []).filter((s) => !linkedStockIds.includes(s.id));

  if (available.length === 0) {
    return (
      <p className="text-xs text-[var(--text-secondary)]">No stocks available to link</p>
    );
  }

  return (
    <div className="flex items-end gap-3">
      <div className="flex-1">
        <Select
          label="Link Stock"
          value={selectedStock}
          onChange={(e) => setSelectedStock(e.target.value)}
          options={[
            { value: '', label: 'Select a stock...' },
            ...available.map((s) => ({ value: s.id, label: `${s.ticker} - ${s.name}` })),
          ]}
        />
      </div>
      <Button
        size="sm"
        disabled={!selectedStock}
        loading={linkStock.isPending}
        onClick={() => {
          linkStock.mutate({ sourceId, stockId: selectedStock }, {
            onSuccess: () => setSelectedStock(''),
          });
        }}
      >
        <LinkIcon size={14} />
        Link
      </Button>
    </div>
  );
}
