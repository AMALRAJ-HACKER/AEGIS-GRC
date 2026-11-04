import type { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-navy text-white hover:bg-navy-dark disabled:bg-navy/50 dark:bg-blue-dark dark:hover:bg-blue',
  secondary: 'bg-white text-navy border border-line hover:bg-gray-50 disabled:opacity-50 dark:bg-black dark:text-white dark:border-gray-700 dark:hover:bg-gray-800',
  ghost: 'bg-transparent text-slate-600 hover:bg-gray-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-gray-800',
  danger: 'bg-crimson text-white hover:bg-red-600 disabled:bg-red-400 dark:bg-crimson/90 dark:hover:bg-crimson',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  size?: 'sm' | 'md';
}

export function Button({ variant = 'primary', loading = false, size = 'md', className = '', children, disabled, ...rest }: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-ring ${size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm'} ${VARIANTS[variant]} ${className}`}
    >
      {loading && <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin text-current" />}
      {children}
    </button>
  );
}
