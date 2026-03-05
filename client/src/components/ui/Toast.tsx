import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useUIStore, type Toast as ToastType } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const styles = {
  success: 'border-[var(--color-buy)]',
  error: 'border-[var(--color-sell)]',
  info: 'border-[var(--accent)]',
};

function ToastItem({ toast }: { toast: ToastType }) {
  const removeToast = useUIStore((s) => s.removeToast);
  const Icon = icons[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex items-center gap-3 bg-[var(--surface)] border-l-4 rounded-xl shadow-lg px-4 py-3 min-w-[300px]',
        styles[toast.type]
      )}
    >
      <Icon size={18} className={toast.type === 'success' ? 'text-[var(--color-buy)]' : toast.type === 'error' ? 'text-[var(--color-sell)]' : 'text-[var(--accent)]'} />
      <span className="flex-1 text-sm text-[var(--text-primary)]">{toast.message}</span>
      <button
        onClick={() => removeToast(toast.id)}
        aria-label="Dismiss notification"
        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

export default function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
