import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { CardSkeleton } from '@/components/ui/Skeleton';
import StockCard from '@/components/stocks/StockCard';
import StockForm from '@/components/stocks/StockForm';
import { useStocks } from '@/hooks/useStocks';
import { useDebounce } from '@/hooks/useDebounce';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

const SECTORS = [
  'Technology', 'Healthcare', 'Financials', 'Energy', 'Consumer Discretionary',
  'Consumer Staples', 'Industrials', 'Materials', 'Real Estate',
  'Communication Services', 'Utilities',
];

export default function StocksPage() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const debouncedSearch = useDebounce(search);
  const { data: stocks, isLoading } = useStocks({
    search: debouncedSearch || undefined,
    sector: sectorFilter || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Stocks</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Track and analyze stocks
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} />
          Add Stock
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or ticker..."
            aria-label="Search stocks"
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
          />
        </div>
        <Select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          options={[
            { value: '', label: 'All Sectors' },
            ...SECTORS.map((s) => ({ value: s, label: s })),
          ]}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {(stocks || []).map((stock) => (
            <motion.div key={stock.id} variants={item}>
              <StockCard stock={stock} />
            </motion.div>
          ))}
          {stocks?.length === 0 && (
            <div className="col-span-full text-center py-12 text-[var(--text-secondary)]">
              <p className="text-sm">No stocks found. Add your first stock.</p>
            </div>
          )}
        </motion.div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add Stock">
        <StockForm onClose={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}
