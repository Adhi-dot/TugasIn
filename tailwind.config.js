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
          subdued: '#F1F5F9',
        },
        hairline: {
          DEFAULT: '#E2E8F0',
          strong: '#CBD5E1',
        },
        ink: {
          DEFAULT: '#0F172A',
          muted: '#64748B',
        },
        accent: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          soft: '#EFF6FF',
          ink: '#1D4ED8',
        },
        success: {
          DEFAULT: '#059669',
          soft: '#ECFDF5',
        },
        danger: {
          DEFAULT: '#E11D48',
          soft: '#FFF1F2',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
