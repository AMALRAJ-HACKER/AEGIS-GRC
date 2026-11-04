import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <Loader2 size={28} className="animate-spin text-current dark:text-blue-400" />
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700 ${className}`} />;
}

export function EmptyState({ icon, title, message, action }: { icon: ReactNode; title: string; message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-line bg-white/60 dark:bg-black px-6 py-14 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-light dark:bg-blue/20 text-blue">{icon}</div>
      <h3 className="text-sm font-bold text-navy dark:text-white">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-slate-600 dark:text-slate-400">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
