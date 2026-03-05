import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-[var(--text-primary)]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            'w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent text-sm resize-y min-h-[80px]',
            error && 'border-[var(--color-sell)]',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[var(--color-sell)]">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
export default Textarea;
