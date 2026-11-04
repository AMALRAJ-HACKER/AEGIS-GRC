import { initials } from '@/lib/format';

const PALETTE = ['#0F2D52', '#1D6FE8', '#10B981', '#F59E0B', '#7C3AED', '#DB2777', '#0891B2'];

export function Avatar({ name, url, size = 32 }: { name?: string | null; url?: string | null; size?: number }) {
  if (url) {
    return <img src={url} alt={name ?? 'avatar'} className="rounded-full object-cover border border-line dark:border-gray-700" style={{ width: size, height: size }} />;
  }
  const h = (name ?? '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const bg = PALETTE[h % PALETTE.length];
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-bold text-white"
      style={{ width: size, height: size, background: bg, fontSize: size * 0.38 }}
    >
      {initials(name)}
    </span>
  );
}
