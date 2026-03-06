import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

export function priorityLabel(priority: number): string {
  if (priority >= 9) return 'Critical';
  if (priority >= 7) return 'High';
  if (priority >= 4) return 'Medium';
  if (priority >= 1) return 'Low';
  return 'None';
}

export const decisionStatusColors: Record<string, string> = {
  researching: 'bg-[var(--color-watching)] text-white',
  considering: 'bg-[var(--color-hold)] text-white',
  bought: 'bg-[var(--color-buy)] text-white',
  passed: 'bg-[var(--color-none)] text-white',
  sold: 'bg-[var(--color-sell)] text-white',
  watching: 'bg-[var(--color-watching)] text-white',
};

export const sourceTypeLabels: Record<string, string> = {
  article: 'Article',
  report: 'Report',
  video: 'Video',
  podcast: 'Podcast',
  tweet: 'Tweet',
  other: 'Other',
};
