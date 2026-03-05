import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className, hover, onClick }: CardProps) {
  const Component = hover ? motion.div : 'div';
  const hoverProps = hover
    ? { whileHover: { scale: 1.02 }, transition: { duration: 0.15 } }
    : {};

  return (
    <Component
      className={cn(
        'bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5',
        hover && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      {...hoverProps}
    >
      {children}
    </Component>
  );
}
