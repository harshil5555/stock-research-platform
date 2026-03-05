import { useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { decisionStatusColors, formatRelative } from '@/lib/utils';
import type { Stock } from '@/types';

interface StockCardProps {
  stock: Stock;
}

export default function StockCard({ stock }: StockCardProps) {
  const navigate = useNavigate();

  return (
    <Card hover onClick={() => navigate(`/stocks/${stock.id}`)}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-[var(--hover)]">
          <TrendingUp size={18} className="text-[var(--accent)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-[var(--accent)]">{stock.ticker}</span>
            <h3 className="text-sm font-medium text-[var(--text-primary)] truncate">
              {stock.companyName}
            </h3>
          </div>
          {stock.sector && (
            <p className="text-xs text-[var(--text-secondary)] mb-2">{stock.sector}</p>
          )}
          <div className="flex items-center gap-2">
            <Badge variant={decisionStatusColors[stock.decisionStatus]}>
              {stock.decisionStatus}
            </Badge>
            <span className="text-xs text-[var(--text-secondary)] ml-auto">
              {formatRelative(stock.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
