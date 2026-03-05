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
                {analysis.title}
              </h3>
              <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)] ml-auto">
                <Clock size={12} />
                {formatRelative(analysis.createdAt)}
              </div>
            </div>
            {analysis.creator && (
              <p className="text-xs text-[var(--text-secondary)] mb-3">
                By {analysis.creator.name}
              </p>
            )}
            <div className="text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
              {analysis.content}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
