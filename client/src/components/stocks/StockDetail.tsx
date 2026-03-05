import { TrendingUp } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { decisionStatusColors, formatDate } from '@/lib/utils';
import type { Stock } from '@/types';

interface StockDetailHeaderProps {
  stock: Stock;
}

export default function StockDetailHeader({ stock }: StockDetailHeaderProps) {
  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-[var(--hover)]">
          <TrendingUp size={28} className="text-[var(--accent)]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xl font-bold text-[var(--accent)]">{stock.ticker}</span>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">{stock.companyName}</h1>
            <Badge variant={decisionStatusColors[stock.decisionStatus]} className="text-sm px-3 py-1">
              {stock.decisionStatus.toUpperCase()}
            </Badge>
          </div>
          {stock.sector && (
            <p className="text-sm text-[var(--text-secondary)] mb-3">{stock.sector}</p>
          )}
          {stock.notes && (
            <p className="text-sm text-[var(--text-secondary)] mb-4">{stock.notes}</p>
          )}
          <div className="flex items-center gap-6">
            <span className="text-xs text-[var(--text-secondary)]">
              Added {formatDate(stock.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
