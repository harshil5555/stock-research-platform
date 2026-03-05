import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Scale, ArrowUpDown } from 'lucide-react';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import DecisionBadge from '@/components/decisions/DecisionBadge';
import { useDecisions } from '@/hooks/useDecisions';
import { formatDate } from '@/lib/utils';

type SortKey = 'createdAt' | 'decision' | 'confidence';

export default function DecisionsPage() {
  const [decisionFilter, setDecisionFilter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortAsc, setSortAsc] = useState(false);

  const { data: decisions, isLoading } = useDecisions({
    decision: decisionFilter || undefined,
  });

  const sorted = [...(decisions || [])].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'createdAt') {
      cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortKey === 'decision') {
      cmp = a.decision.localeCompare(b.decision);
    } else if (sortKey === 'confidence') {
      cmp = (a.confidence ?? 0) - (b.confidence ?? 0);
    }
    return sortAsc ? cmp : -cmp;
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Decisions</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Investment decisions across all stocks
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Select
          value={decisionFilter}
          onChange={(e) => setDecisionFilter(e.target.value)}
          options={[
            { value: '', label: 'All Decisions' },
            { value: 'buy', label: 'Buy' },
            { value: 'sell', label: 'Sell' },
            { value: 'hold', label: 'Hold' },
            { value: 'watching', label: 'Watching' },
            { value: 'none', label: 'None' },
          ]}
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left text-xs font-medium text-[var(--text-secondary)] px-5 py-3">Stock</th>
                  <th
                    className="text-left text-xs font-medium text-[var(--text-secondary)] px-5 py-3 cursor-pointer select-none hover:text-[var(--text-primary)]"
                    onClick={() => toggleSort('decision')}
                  >
                    <span className="inline-flex items-center gap-1">
                      Decision <ArrowUpDown size={12} />
                    </span>
                  </th>
                  <th className="text-left text-xs font-medium text-[var(--text-secondary)] px-5 py-3">Target</th>
                  <th
                    className="text-left text-xs font-medium text-[var(--text-secondary)] px-5 py-3 cursor-pointer select-none hover:text-[var(--text-primary)]"
                    onClick={() => toggleSort('confidence')}
                  >
                    <span className="inline-flex items-center gap-1">
                      Confidence <ArrowUpDown size={12} />
                    </span>
                  </th>
                  <th className="text-left text-xs font-medium text-[var(--text-secondary)] px-5 py-3">By</th>
                  <th
                    className="text-left text-xs font-medium text-[var(--text-secondary)] px-5 py-3 cursor-pointer select-none hover:text-[var(--text-primary)]"
                    onClick={() => toggleSort('createdAt')}
                  >
                    <span className="inline-flex items-center gap-1">
                      Date <ArrowUpDown size={12} />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((d, i) => (
                  <motion.tr
                    key={d.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--hover)] transition-colors"
                  >
                    <td className="px-5 py-3">
                      <Link
                        to={`/stocks/${d.stockId}`}
                        className="text-sm font-semibold text-[var(--accent)] hover:underline"
                      >
                        {d.stock?.ticker || 'N/A'}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <DecisionBadge decision={d.decision} />
                    </td>
                    <td className="px-5 py-3 text-sm text-[var(--text-primary)]">
                      {d.targetPrice ? `$${d.targetPrice.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-5 py-3">
                      {d.confidence ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-[var(--hover)]">
                            <div
                              className="h-full rounded-full bg-[var(--accent)]"
                              style={{ width: `${d.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs text-[var(--text-secondary)]">{d.confidence}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--text-secondary)]">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm text-[var(--text-secondary)]">
                      {d.creator?.displayName || 'Unknown'}
                    </td>
                    <td className="px-5 py-3 text-xs text-[var(--text-secondary)]">
                      {formatDate(d.createdAt)}
                    </td>
                  </motion.tr>
                ))}
                {sorted.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-sm text-[var(--text-secondary)]">
                      No decisions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
