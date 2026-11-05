import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // Light mode only. Dark mode is intentionally not configured.
  theme: {
    extend: {
      colors: {
        // Brand
        navy: { DEFAULT: '#0F2D52', dark: '#0A2038', light: '#EAF0F7' },

        // Accents — keep the full numeric scales and add brand variants
        blue: { ...colors.blue, DEFAULT: '#1D6FE8', dark: '#1558BE', light: '#E8F0FD' },
        indigo: { ...colors.indigo, DEFAULT: '#6366F1', dark: '#4F46E5', light: '#EEF0FF' },
        purple: { ...colors.purple, DEFAULT: '#8B5CF6', dark: '#7C3AED', light: '#F3EEFF' },
        emerald: { ...colors.emerald, DEFAULT: '#059669', light: '#ECFDF5' },
        amber: { ...colors.amber, DEFAULT: '#D97706', light: '#FFFBEB' },

        // Semantic accents
        emerald2: '#10B981',
        amber2: '#F59E0B',
        crimson: { DEFAULT: '#EF4444', light: '#FEF2F2' },

        // Surfaces & text
        canvas: '#F7F8FA',
        line: '#E2E8F0',
        ink: { DEFAULT: '#0F172A', muted: '#64748B' },
        'border-focus': '#CBD5E1',
        card: '#FFFFFF',
        popover: '#FFFFFF',
      },
      borderRadius: {
        card: '12px',
        xl: '14px',
        '2xl': '18px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 45, 82, 0.04), 0 1px 3px rgba(15, 45, 82, 0.06)',
        pop: '0 12px 32px rgba(15, 45, 82, 0.14)',
        soft: '0 4px 16px rgba(15, 45, 82, 0.06)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
