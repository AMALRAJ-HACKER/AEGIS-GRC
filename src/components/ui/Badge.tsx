import type { ReactNode } from 'react';

type Tone = 'success' | 'warning' | 'critical' | 'info' | 'default';

const TONES: Record<Tone, string> = {
  success: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald2 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700',
  warning: 'bg-amber-50 dark:bg-amber-900/30 text-amber2 dark:text-amber-400 border-amber-200 dark:border-amber-700',
  critical: 'bg-red-50 dark:bg-red-900/30 text-crimson dark:text-red-400 border-red-200 dark:border-red-700',
  info: 'bg-blue-light dark:bg-blue-900/30 text-blue-dark dark:text-blue-400 border-blue-200 dark:border-blue-700',
  default: 'bg-gray-100 dark:bg-gray-800 text-slate-600 dark:text-slate-300 border-line dark:border-gray-700',
};

export function Badge({ label, tone = 'default', className = '' }: { label: string; tone?: Tone; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 border px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide ${TONES[tone] ?? TONES.default} ${className}`}
    >
      {label}
    </span>
  );
}

export function Dot({ tone }: { tone: Tone }) {
  const colors: Record<Tone, string> = {
    success: 'bg-emerald2 dark:bg-emerald-500', warning: 'bg-amber2 dark:bg-amber-500', critical: 'bg-crimson dark:bg-crimson-500', info: 'bg-blue dark:bg-blue-500', default: 'bg-gray-400 dark:bg-gray-500',
  };
  return <span className={`inline-block h-2 w-2 rounded-full ${colors[tone] ?? colors.default}`} />;
}

export type { Tone, ReactNode };
