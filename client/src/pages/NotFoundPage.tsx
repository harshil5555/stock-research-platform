import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <h1 className="text-6xl font-bold text-[var(--text-primary)] mb-2">404</h1>
      <p className="text-lg text-[var(--text-secondary)] mb-6">Page not found</p>
      <Link to="/">
        <Button variant="secondary">
          <ArrowLeft size={16} />
          Back to Dashboard
        </Button>
      </Link>
    </motion.div>
  );
}
