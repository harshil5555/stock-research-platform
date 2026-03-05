import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, options, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-[var(--text-primary)]">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={cn(
              'w-full px-3.5 py-2.5 pr-9 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent text-sm appearance-none',
              error && 'border-[var(--color-sell)]',
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
        </div>
        {error && <p className="text-xs text-[var(--color-sell)]">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
export default Select;
