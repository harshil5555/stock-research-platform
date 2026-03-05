import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpDown } from 'lucide-react';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import DecisionBadge from '@/components/decisions/DecisionBadge';
import { useStocks } from '@/hooks/useStocks';
import { formatDate } from '@/lib/utils';

export default function DecisionsPage() {
  const { data: stocks, isLoading } = useStocks();

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
                  <th className="text-left text-xs font-medium text-[var(--text-secondary)] px-5 py-3">Ticker</th>
                  <th className="text-left text-xs font-medium text-[var(--text-secondary)] px-5 py-3">Company</th>
                  <th className="text-left text-xs font-medium text-[var(--text-secondary)] px-5 py-3">
                    <span className="inline-flex items-center gap-1">
                      Status <ArrowUpDown size={12} />
                    </span>
                  </th>
                  <th className="text-left text-xs font-medium text-[var(--text-secondary)] px-5 py-3">Sector</th>
                  <th className="text-left text-xs font-medium text-[var(--text-secondary)] px-5 py-3">
                    <span className="inline-flex items-center gap-1">
                      Date <ArrowUpDown size={12} />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {(stocks || []).map((s, i) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--hover)] transition-colors"
                  >
                    <td className="px-5 py-3">
                      <Link
                        to={`/stocks/${s.id}`}
                        className="text-sm font-semibold text-[var(--accent)] hover:underline"
                      >
                        {s.ticker}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-sm text-[var(--text-primary)]">
                      {s.companyName}
                    </td>
                    <td className="px-5 py-3">
                      <DecisionBadge status={s.decisionStatus} />
                    </td>
                    <td className="px-5 py-3 text-sm text-[var(--text-secondary)]">
                      {s.sector || '-'}
                    </td>
                    <td className="px-5 py-3 text-xs text-[var(--text-secondary)]">
                      {formatDate(s.createdAt)}
                    </td>
                  </motion.tr>
                ))}
                {(stocks || []).length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-sm text-[var(--text-secondary)]">
                      No stocks found
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
