export function Tabs<T extends string>({ tabs, active, onChange, className = '' }: {
  tabs: { id: T; label: string; badge?: number }[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div className={`flex gap-1 overflow-x-auto border-b border-line ${className}`}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`relative whitespace-nowrap px-3.5 py-2.5 text-xs font-semibold transition-colors focus-ring ${
            active === t.id ? 'text-blue' : 'text-slate-600 hover:text-navy'
          }`}
        >
          {t.label}
          {typeof t.badge === 'number' && t.badge > 0 && (
            <span className="ml-1.5 rounded-full bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 text-[10px] text-slate-600 dark:text-slate-300">{t.badge}</span>
          )}
          {active === t.id && <span className="absolute inset-x-1 -bottom-px h-0.5 rounded bg-blue dark:bg-blue-400" />}
        </button>
      ))}
    </div>
  );
}