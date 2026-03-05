import { TrendingUp, DollarSign, BarChart3 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { decisionColors, formatDate } from '@/lib/utils';
import type { Stock } from '@/types';

interface StockDetailHeaderProps {
  stock: Stock;
}

export default function StockDetailHeader({ stock }: StockDetailHeaderProps) {
  const latestDecision = stock.decisions?.[0];

  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-[var(--hover)]">
          <TrendingUp size={28} className="text-[var(--accent)]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xl font-bold text-[var(--accent)]">{stock.ticker}</span>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">{stock.name}</h1>
            {latestDecision && (
              <Badge variant={decisionColors[latestDecision.decision]} className="text-sm px-3 py-1">
                {latestDecision.decision.toUpperCase()}
              </Badge>
            )}
          </div>
          {stock.sector && (
            <p className="text-sm text-[var(--text-secondary)] mb-3">{stock.sector}</p>
          )}
          {stock.description && (
            <p className="text-sm text-[var(--text-secondary)] mb-4">{stock.description}</p>
          )}
          <div className="flex items-center gap-6">
            {stock.currentPrice && (
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-[var(--text-secondary)]" />
                <span className="text-lg font-semibold text-[var(--text-primary)]">
                  ${stock.currentPrice.toFixed(2)}
                </span>
              </div>
            )}
            {latestDecision?.targetPrice && (
              <div className="flex items-center gap-2">
                <BarChart3 size={16} className="text-[var(--text-secondary)]" />
                <span className="text-sm text-[var(--text-secondary)]">
                  Target: ${latestDecision.targetPrice.toFixed(2)}
                </span>
              </div>
            )}
            <span className="text-xs text-[var(--text-secondary)]">
              Added {formatDate(stock.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
