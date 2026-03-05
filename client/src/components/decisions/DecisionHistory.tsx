import { motion } from 'framer-motion';
import { History, Target, BarChart } from 'lucide-react';
import DecisionBadge from './DecisionBadge';
import Card from '@/components/ui/Card';
import { formatRelative } from '@/lib/utils';
import type { Decision } from '@/types';

interface DecisionHistoryProps {
  decisions: Decision[];
}

export default function DecisionHistory({ decisions }: DecisionHistoryProps) {
  if (decisions.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--text-secondary)]">
        <History size={32} className="mx-auto mb-3 opacity-50" />
        <p className="text-sm">No decisions recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {decisions.map((d, i) => (
        <motion.div
          key={d.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Card>
            <div className="flex items-start gap-3">
              <DecisionBadge decision={d.decision} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 text-sm">
                  {d.targetPrice && (
                    <span className="flex items-center gap-1 text-[var(--text-secondary)]">
                      <Target size={14} />
                      ${d.targetPrice.toFixed(2)}
                    </span>
                  )}
                  {d.confidence && (
                    <span className="flex items-center gap-1 text-[var(--text-secondary)]">
                      <BarChart size={14} />
                      {d.confidence}% confidence
                    </span>
                  )}
                  <span className="text-xs text-[var(--text-secondary)] ml-auto">
                    {d.creator?.displayName} - {formatRelative(d.createdAt)}
                  </span>
                </div>
                {d.notes && (
                  <p className="text-sm text-[var(--text-primary)] mt-2 whitespace-pre-wrap">
                    {d.notes}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
