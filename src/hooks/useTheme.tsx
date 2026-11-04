import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

const ThemeContext = createContext<{
  theme: Theme;
  resolved: 'light' | 'dark';
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
} | null>(null);

/** Read stored theme preference synchronously (no useEffect, prevents FOUC). */
function getStoredTheme(): Theme {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('aegis-theme') as Theme | null;
    if (stored) return stored;
  }
  return 'system';
}

/** Compute resolved theme from stored preference + system preference. */
function resolveTheme(t: Theme): 'light' | 'dark' {
  if (t === 'system') {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return t;
}

export function ThemeProvider({ children, defaultTheme = 'system' }: { children: ReactNode; defaultTheme?: Theme }) {
  // Initialize from stored value immediately (not in useEffect) to prevent FOUC
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme());
  const [resolved, setResolved] = useState<'light' | 'dark'>(() => resolveTheme(defaultTheme));

  // Apply theme class to document root
  useEffect(() => {
    const root = document.documentElement;
    const next = resolveTheme(theme);
    setResolved(next);

    if (next === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem('aegis-theme', theme);
  }, [theme]);

  // Listen for system preference changes
  useEffect(() => {
    if (theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const next = e.matches ? 'dark' : 'light';
      setResolved(next);
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);

  const toggleTheme = () => {
    const current = resolved;
    setTheme(current === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
