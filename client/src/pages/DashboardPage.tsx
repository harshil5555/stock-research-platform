import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  FileText,
  CheckSquare,
  AlertCircle,
  Plus,
  ArrowRight,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { CardSkeleton } from '@/components/ui/Skeleton';
import SourceForm from '@/components/sources/SourceForm';
import StockForm from '@/components/stocks/StockForm';
import TodoForm from '@/components/todos/TodoForm';
import { useDashboardStats } from '@/hooks/useDashboard';
import { formatRelative } from '@/lib/utils';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();
  const navigate = useNavigate();
  const [showSourceForm, setShowSourceForm] = useState(false);
  const [showStockForm, setShowStockForm] = useState(false);
  const [showTodoForm, setShowTodoForm] = useState(false);

  const statCards = [
    { label: 'Stocks', value: stats?.totalStocks ?? 0, icon: TrendingUp, color: 'var(--accent)', to: '/stocks' },
    { label: 'Sources', value: stats?.totalSources ?? 0, icon: FileText, color: 'var(--color-watching)', to: '/sources' },
    { label: 'Total Todos', value: stats?.totalTodos ?? 0, icon: CheckSquare, color: 'var(--color-buy)', to: '/todos' },
    { label: 'Pending', value: stats?.pendingTodos ?? 0, icon: AlertCircle, color: 'var(--color-hold)', to: '/todos' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Dashboard</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Overview of your research</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setShowSourceForm(true)}>
            <Plus size={14} />
            Source
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setShowTodoForm(true)}>
            <Plus size={14} />
            Todo
          </Button>
          <Button size="sm" onClick={() => setShowStockForm(true)}>
            <Plus size={14} />
            Stock
          </Button>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map((s) => (
          <motion.div key={s.label} variants={item}>
            <Card hover onClick={() => navigate(s.to)}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl" style={{ backgroundColor: `color-mix(in srgb, ${s.color} 15%, transparent)` }}>
                  <s.icon size={20} style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{s.value}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{s.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Recent Activity</h2>
        </div>
        <Card>
          {stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="divide-y divide-[var(--border)]">
              {stats.recentActivity.map((activity, i) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                  <span className="text-sm text-[var(--text-primary)] flex-1">
                    {activity.description}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)] shrink-0">
                    {formatRelative(activity.createdAt)}
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-[var(--text-secondary)]">No recent activity</p>
              <Button size="sm" className="mt-3" onClick={() => navigate('/sources')}>
                Get Started <ArrowRight size={14} />
              </Button>
            </div>
          )}
        </Card>
      </div>

      <Modal open={showSourceForm} onClose={() => setShowSourceForm(false)} title="New Source">
        <SourceForm onClose={() => setShowSourceForm(false)} />
      </Modal>
      <Modal open={showStockForm} onClose={() => setShowStockForm(false)} title="New Stock">
        <StockForm onClose={() => setShowStockForm(false)} />
      </Modal>
      <Modal open={showTodoForm} onClose={() => setShowTodoForm(false)} title="New Todo">
        <TodoForm onClose={() => setShowTodoForm(false)} />
      </Modal>
    </div>
  );
}
