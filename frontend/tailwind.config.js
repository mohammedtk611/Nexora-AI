/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        surface: {
          DEFAULT: 'var(--surface)',
          hover: 'var(--surface-hover)',
        },
        border: {
          DEFAULT: 'var(--border)',
          light: 'var(--border-light)',
        },
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        accent: {
          DEFAULT: 'var(--accent)',
          light: 'var(--accent-light)',
          secondary: 'var(--accent-secondary)',
        },
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        dark: {
          950: '#0B0B0C',
          900: '#101112',
          850: '#151617',
          800: '#18191A',
          750: '#232426',
          700: '#29292B',
          600: '#3a3a3d',
        },
        cyber: {
          blue: '#38bdf8',
          emerald: '#10b981',
          amber: '#f59e0b',
          red: '#ef4444',
          purple: '#a855f7'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
