import { motion } from 'framer-motion';
import { FileEdit, Clock } from 'lucide-react';
import Card from '@/components/ui/Card';
import { formatRelative } from '@/lib/utils';
import type { Analysis } from '@/types';

interface AnalysisViewProps {
  analyses: Analysis[];
}

export default function AnalysisView({ analyses }: AnalysisViewProps) {
  if (analyses.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--text-secondary)]">
        <FileEdit size={32} className="mx-auto mb-3 opacity-50" />
        <p className="text-sm">No analyses yet. Be the first to write one.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {analyses.map((analysis, i) => (
        <motion.div
          key={analysis.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Analysis by {analysis.authorName ?? `User ${analysis.userId.slice(0, 8)}`}
              </h3>
              {analysis.targetPrice && (
                <span className="text-xs text-[var(--text-secondary)]">
                  Target: {analysis.targetPrice}
                </span>
              )}
              <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)] ml-auto">
                <Clock size={12} />
                {formatRelative(analysis.createdAt)}
              </div>
            </div>
            {analysis.thesis && (
              <div className="mb-3">
                <h4 className="text-xs font-medium text-[var(--text-secondary)] mb-1">Thesis</h4>
                <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{analysis.thesis}</p>
              </div>
            )}
            {analysis.bullCase && (
              <div className="mb-3">
                <h4 className="text-xs font-medium text-[var(--text-secondary)] mb-1">Bull Case</h4>
                <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{analysis.bullCase}</p>
              </div>
            )}
            {analysis.bearCase && (
              <div className="mb-3">
                <h4 className="text-xs font-medium text-[var(--text-secondary)] mb-1">Bear Case</h4>
                <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{analysis.bearCase}</p>
              </div>
            )}
            {analysis.notes && (
              <div>
                <h4 className="text-xs font-medium text-[var(--text-secondary)] mb-1">Notes</h4>
                <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{analysis.notes}</p>
              </div>
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
