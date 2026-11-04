import { useState, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

const FIELD = 'w-full rounded-lg border border-line bg-white dark:bg-black px-3 py-2.5 text-sm text-ink dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-ring focus:border-blue';

export function Field({ label, error, hint, children }: { label: string; error?: string | null; hint?: string; children: any }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-[11px] text-slate-500 dark:text-slate-400">{hint}</span>}
      {error && <span className="mt-1 block text-[11px] font-medium text-crimson">{error}</span>}
    </label>
  );
}

export function Input({ label, error, hint, className = '', ...rest }: InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string | null; hint?: string }) {
  const input = <input {...rest} className={`${FIELD} ${className}`} />;
  if (!label) return input;
  return <Field label={label} error={error} hint={hint}>{input}</Field>;
}

export function PasswordInput({ label, error, hint, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string | null; hint?: string }) {
  const [show, setShow] = useState(false);
  const input = (
    <div className="relative">
      <input {...rest} type={show ? 'text' : 'password'} className={`${FIELD} pr-12`} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-blue hover:underline"
      >
        {show ? 'HIDE' : 'SHOW'}
      </button>
    </div>
  );
  if (!label) return input;
  return <Field label={label} error={error} hint={hint}>{input}</Field>;
}

export function Select({ label, error, className = '', children, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string | null }) {
  const select = <select {...rest} className={`${FIELD} appearance-none bg-no-repeat pr-8 ${className}`} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundPosition: 'right 10px center' }}>{children}</select>;
  if (!label) return select;
  return <Field label={label} error={error}>{select}</Field>;
}

export function Textarea({ label, error, className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string | null }) {
  const ta = <textarea {...rest} rows={rest.rows ?? 3} className={`${FIELD} resize-y ${className}`} />;
  if (!label) return ta;
  return <Field label={label} error={error}>{ta}</Field>;
}