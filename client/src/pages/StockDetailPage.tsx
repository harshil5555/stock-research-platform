import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import StockDetailHeader from '@/components/stocks/StockDetail';
import StockForm from '@/components/stocks/StockForm';
import AnalysisView from '@/components/analysis/AnalysisView';
import AnalysisEditor from '@/components/analysis/AnalysisEditor';
import CommentThread from '@/components/comments/CommentThread';
import DecisionForm from '@/components/decisions/DecisionForm';
import DecisionHistory from '@/components/decisions/DecisionHistory';
import { useStock, useStockAnalyses, useDeleteStock } from '@/hooks/useStocks';
import { useDecisions } from '@/hooks/useDecisions';

export default function StockDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: stock, isLoading } = useStock(id ?? '');
  const { data: analyses } = useStockAnalyses(id ?? '');
  const { data: decisions } = useDecisions(id ?? '');
  const deleteStock = useDeleteStock();
  const navigate = useNavigate();
  const [tab, setTab] = useState('analysis');
  const [showAnalysisForm, setShowAnalysisForm] = useState(false);
  const [showDecisionForm, setShowDecisionForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

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
      <div className="flex items-center justify-between">
        <Link
          to="/stocks"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Stocks
        </Link>
        <div className="flex gap-1">
          <button
            onClick={() => setShowEditForm(true)}
            aria-label="Edit stock"
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--hover)] transition-all"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => {
              if (window.confirm('Delete this stock? This cannot be undone.')) {
                deleteStock.mutate(stock.id, { onSuccess: () => navigate('/stocks') });
              }
            }}
            aria-label="Delete stock"
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--color-sell)] hover:bg-[var(--hover)] transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

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

      <Modal open={showEditForm} onClose={() => setShowEditForm(false)} title="Edit Stock">
        <StockForm stock={stock} onClose={() => setShowEditForm(false)} />
      </Modal>
    </div>
  );
}
