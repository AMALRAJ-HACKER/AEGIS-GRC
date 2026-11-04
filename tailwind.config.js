/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        border: '#E2E8F0',
        input: '#F1F5F9',
        ring: '#3B82F6',
        background: '#FFFFFF',
        foreground: '#0F172A',
        primary: '#0F2D52',
        primaryforeground: '#FFFFFF',
        secondary: '#F8FAFC',
        secondaryforeground: '#0F2D52',
        muted: '#64748B',
        mutedforeground: '#94A3B8',
        accent: '#3B82F6',
        destructive: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B',
        chart: {
          1: '#0891B2',
          2: '#6366F1',
          3: '#8B5CF6',
          4: '#10B981',
          5: '#F59E0B',
        },
        card: '#FFFFFF',
        popover: '#FFFFFF',
        cardforeground: '#0F2D52',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
}