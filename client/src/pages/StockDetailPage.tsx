import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import StockDetailHeader from '@/components/stocks/StockDetail';
import AnalysisView from '@/components/analysis/AnalysisView';
import AnalysisEditor from '@/components/analysis/AnalysisEditor';
import CommentThread from '@/components/comments/CommentThread';
import DecisionForm from '@/components/decisions/DecisionForm';
import DecisionHistory from '@/components/decisions/DecisionHistory';
import { useStock, useStockAnalyses } from '@/hooks/useStocks';
import { useDecisions } from '@/hooks/useDecisions';

export default function StockDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: stock, isLoading } = useStock(id ?? '');
  const { data: analyses } = useStockAnalyses(id ?? '');
  const { data: decisions } = useDecisions(id ?? '');
  const [tab, setTab] = useState('analysis');
  const [showAnalysisForm, setShowAnalysisForm] = useState(false);
  const [showDecisionForm, setShowDecisionForm] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!stock) {
    return <p className="text-[var(--text-secondary)]">Stock not found</p>;
  }

  const tabs = [
    { id: 'analysis', label: 'Analysis', count: analyses?.length },
    { id: 'discussion', label: 'Discussion' },
    { id: 'decisions', label: 'Decisions', count: decisions?.length },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <Link
        to="/stocks"
        className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Stocks
      </Link>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <StockDetailHeader stock={stock} />
      </motion.div>

      <div className="flex items-center justify-between gap-4">
        <Tabs tabs={tabs} active={tab} onChange={setTab} />
        <div className="flex gap-2">
          {tab === 'analysis' && (
            <Button size="sm" onClick={() => setShowAnalysisForm(true)}>
              <Plus size={14} />
              Write Analysis
            </Button>
          )}
          {tab === 'decisions' && (
            <Button size="sm" onClick={() => setShowDecisionForm(true)}>
              <Plus size={14} />
              New Decision
            </Button>
          )}
        </div>
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
      >
        {tab === 'analysis' && <AnalysisView analyses={analyses || []} />}

        {tab === 'discussion' && <CommentThread stockId={stock.id} />}

        {tab === 'decisions' && <DecisionHistory decisions={decisions || []} />}
      </motion.div>

      <Modal open={showAnalysisForm} onClose={() => setShowAnalysisForm(false)} title="Write Analysis" className="max-w-2xl">
        <AnalysisEditor stockId={stock.id} onClose={() => setShowAnalysisForm(false)} />
      </Modal>

      <Modal open={showDecisionForm} onClose={() => setShowDecisionForm(false)} title="Record Decision">
        <DecisionForm stockId={stock.id} onClose={() => setShowDecisionForm(false)} />
      </Modal>
    </div>
  );
}
