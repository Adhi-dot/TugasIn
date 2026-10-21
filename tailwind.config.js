/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#f8fafc',
        surface: {
          DEFAULT: '#ffffff',
          subtle: '#f1f5f9',
        },
        hairline: {
          DEFAULT: '#e2e8f0',
          strong: '#cbd5e1',
        },
        ink: {
          DEFAULT: '#0f172a',
          muted: '#64748b',
          subtle: '#94a3b8',
        },
        brand: {
          50: '#ecfdf5',
          600: '#059669',
          700: '#047857',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '0.75rem',
        input: '0.5rem',
      },
    },
  },
  plugins: [],
}
