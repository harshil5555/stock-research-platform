import { useId } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export default function Tabs({ tabs, active, onChange, className }: TabsProps) {
  const instanceId = useId();

  return (
    <div role="tablist" className={cn('flex gap-1 p-1 bg-[var(--hover)] rounded-xl', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'relative px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            active === tab.id
              ? 'text-[var(--text-primary)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          )}
        >
          {active === tab.id && (
            <motion.div
              layoutId={`activeTab-${instanceId}`}
              className="absolute inset-0 bg-[var(--surface)] rounded-lg shadow-sm"
              transition={{ duration: 0.15 }}
            />
          )}
          <span className="relative z-10">
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1.5 text-xs text-[var(--text-secondary)]">{tab.count}</span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
