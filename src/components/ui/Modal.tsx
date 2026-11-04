import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

export function Modal({ open, onClose, title, children, wide = false }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/40 dark:bg-black/60 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`relative w-full ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[85vh] overflow-y-auto thin-scroll rounded-card bg-white dark:bg-black shadow-pop`}>
        <div className="sticky top-0 flex items-center justify-between border-b border-line bg-white dark:bg-black px-5 py-3.5 rounded-t-card">
          <h3 className="text-sm font-bold text-navy dark:text-white">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus-ring" aria-label="Close">
            <X size={18} stroke="currentColor" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false, loading = false }: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; confirmLabel?: string; danger?: boolean; loading?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-lg border border-line bg-white dark:bg-black px-4 py-2 text-sm font-semibold text-navy dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 focus-ring">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`rounded-lg px-4 py-2 text-sm font-semibold text-white focus-ring ${danger ? 'bg-crimson hover:bg-red-600' : 'bg-navy hover:bg-navy-dark dark:bg-blue-dark dark:hover:bg-blue'} disabled:opacity-50`}
        >
          {loading ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
