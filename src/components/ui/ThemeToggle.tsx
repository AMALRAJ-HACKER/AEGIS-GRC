import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { toggleTheme, resolved } = useTheme();
  const isDark = resolved === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 rounded-lg p-2 transition-colors focus-ring
        ${isDark ? 'bg-gray-700 text-amber-400 hover:bg-gray-600' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'}"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun size={16} stroke="currentColor" /> : <Moon size={16} stroke="currentColor" />}
    </button>
  );
}
