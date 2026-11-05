import type { ReactNode } from 'react';

type Tone = 'success' | 'warning' | 'critical' | 'info' | 'default';

const TONES: Record<Tone, string> = {
  success: 'bg-emerald-50 text-emerald2 border-emerald-200',
  warning: 'bg-amber-50 text-amber2 border-amber-200',
  critical: 'bg-red-50 text-crimson border-red-200',
  info: 'bg-blue-light text-blue-dark border-blue-200',
  default: 'bg-gray-100 text-slate-600 border-line',
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
    success: 'bg-emerald2', warning: 'bg-amber2', critical: 'bg-crimson', info: 'bg-blue', default: 'bg-gray-400',
  };
  return <span className={`inline-block h-2 w-2 rounded-full ${colors[tone] ?? colors.default}`} />;
}

export type { Tone, ReactNode };
