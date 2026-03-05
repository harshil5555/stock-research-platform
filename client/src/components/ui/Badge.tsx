import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: string;
}

export default function Badge({ children, className, variant }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variant || 'bg-[var(--hover)] text-[var(--text-secondary)]',
        className
      )}
    >
      {children}
    </span>
  );
}
