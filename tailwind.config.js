/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Stitch Brand & Surface Tokens
        'forest-green': '#214f3e',
        'lime-accent': '#d6edaa',
        'ivory-bg': '#f7f8f4',
        'dark-ink': '#233a30',
        'primary-green': '#043828',
        background: '#f9faf6',
        surface: '#f9faf6',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f3f4f0',
        'surface-container': '#edeeea',
        'surface-container-high': '#e7e9e5',
        'surface-container-highest': '#e2e3df',
        'on-surface': '#1a1c1a',
        'on-surface-variant': '#414944',
        outline: '#717974',
        'outline-variant': '#c0c8c2',
        secondary: '#526530',
        'secondary-container': '#d4eba8',
        'on-secondary-container': '#586b35',
        'on-primary-container': '#90c0aa',

        // Legacy / Semantic mappings for existing components
        canvas: '#f9faf6',
        border: {
          DEFAULT: '#e2e3df',
          strong: '#c0c8c2',
        },
        hairline: {
          DEFAULT: '#e2e3df',
          strong: '#c0c8c2',
        },
        ink: {
          DEFAULT: '#233a30',
          primary: '#1a1c1a',
          secondary: '#414944',
          muted: '#717974',
          subtle: '#a0a8a2',
          faint: '#c0c8c2',
        },
        brand: {
          primary: '#214f3e',
          hover: '#193e31',
          light: '#d6edaa',
          50: '#f3f4f0',
          600: '#214f3e',
          700: '#043828',
        },
        accent: {
          DEFAULT: '#d6edaa',
          hover: '#c4e094',
          soft: '#f1f8e5',
          ink: '#233a30',
        },
        success: {
          DEFAULT: '#214f3e',
          soft: '#e8f5ec',
        },
        danger: {
          DEFAULT: '#ba1a1a',
          soft: '#ffdad6',
        },
        status: {
          'not-started-bg': '#f3f4f0',
          'not-started-text': '#414944',
          'in-progress-bg': '#d4eba8',
          'in-progress-text': '#3b4d1a',
          'done-bg': '#e8f5ec',
          'done-text': '#214f3e',
        },
        urgent: {
          'overdue-bg': '#ffdad6',
          'overdue-border': '#ffb4ab',
          'overdue-text': '#ba1a1a',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        card: '0.75rem',
        input: '0.5rem',
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(35, 58, 48, 0.05)',
        'card-hover': '0 4px 6px -1px rgba(35, 58, 48, 0.08), 0 2px 4px -2px rgba(35, 58, 48, 0.04)',
      },
    },
  },
  plugins: [],
};
