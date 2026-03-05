import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelative(date: string) {
  const now = Date.now();
  const d = new Date(date).getTime();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export const priorityColors: Record<string, string> = {
  immediate: 'bg-[var(--color-priority-immediate)] text-white',
  high: 'bg-[var(--color-priority-high)] text-white',
  medium: 'bg-[var(--color-priority-medium)] text-[#1D1D1F]',
  low: 'bg-[var(--color-priority-low)] text-white',
};

export const decisionColors: Record<string, string> = {
  buy: 'bg-[var(--color-buy)] text-white',
  sell: 'bg-[var(--color-sell)] text-white',
  hold: 'bg-[var(--color-hold)] text-white',
  watching: 'bg-[var(--color-watching)] text-white',
  none: 'bg-[var(--color-none)] text-white',
};

export const sourceTypeLabels: Record<string, string> = {
  article: 'Article',
  report: 'Report',
  filing: 'Filing',
  news: 'News',
  analysis: 'Analysis',
  other: 'Other',
};
