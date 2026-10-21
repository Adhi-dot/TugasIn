/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F8FAFC',
        surface: {
          DEFAULT: '#FFFFFF',
          subtle: '#F8FAFC',
          hover: '#F1F5F9',
        },
        'surface-subtle': '#F8FAFC',
        'surface-hover': '#F1F5F9',
        border: '#E2E8F0',
        'border-strong': '#CBD5E1',
        hairline: {
          DEFAULT: '#E2E8F0',
          strong: '#CBD5E1',
        },
        ink: {
          DEFAULT: '#0F172A',
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#64748B',
          subtle: '#94A3B8',
          faint: '#94A3B8',
        },
        brand: {
          primary: '#4F46E5',
          hover: '#4338CA',
          light: '#EEF2FF',
          50: '#ECFDF5',
          600: '#059669',
          700: '#047857',
        },
        status: {
          'not-started-bg': '#F1F5F9',
          'not-started-text': '#475569',
          'in-progress-bg': '#FEF3C7',
          'in-progress-text': '#92400E',
          'done-bg': '#ECFDF5',
          'done-text': '#065F46',
        },
        urgent: {
          'overdue-bg': '#FFF1F2',
          'overdue-border': '#FECDD3',
          'overdue-text': '#BE123C',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        card: '0.75rem',
        input: '0.5rem',
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '16px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
      },
    },
  },
  plugins: [],
};
