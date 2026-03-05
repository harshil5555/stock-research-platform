import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { CardSkeleton } from '@/components/ui/Skeleton';
import SourceCard from '@/components/sources/SourceCard';
import SourceForm from '@/components/sources/SourceForm';
import { useSources } from '@/hooks/useSources';
import { useDebounce } from '@/hooks/useDebounce';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export default function SourcesPage() {
  const [showForm, setShowForm] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { data: sources, isLoading } = useSources({
    sourceType: typeFilter || undefined,
    search: debouncedSearch || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Sources</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Research sources and documents
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} />
          Add Source
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sources..."
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
          />
        </div>
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          options={[
            { value: '', label: 'All Types' },
            { value: 'article', label: 'Article' },
            { value: 'report', label: 'Report' },
            { value: 'video', label: 'Video' },
            { value: 'podcast', label: 'Podcast' },
            { value: 'tweet', label: 'Tweet' },
            { value: 'other', label: 'Other' },
          ]}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {(sources || []).map((source) => (
            <motion.div key={source.id} variants={item}>
              <SourceCard source={source} />
            </motion.div>
          ))}
          {sources?.length === 0 && (
            <div className="col-span-full text-center py-12 text-[var(--text-secondary)]">
              <p className="text-sm">No sources found. Add your first source.</p>
            </div>
          )}
        </motion.div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add Source">
        <SourceForm onClose={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}
