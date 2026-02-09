/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui';

export default {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407', // Darker shade for dark mode
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        bakery: {
          brown: '#8B4513',
          cream: '#FFF8DC',
          gold: '#FFD700',
          'dark-brown': '#5c2e0c',
          'dark-cream': '#f0e6cc',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundColor: {
        dark: {
          primary: '#0f172a',
          secondary: '#1e293b',
          accent: '#334155',
        },
      },
      textColor: {
        dark: {
          primary: '#f8fafc',
          secondary: '#e2e8f0',
          muted: '#94a3b8',
        },
      },
    },
  },
  plugins: [
    daisyui,
    function ({ addComponents }) {
      addComponents({
        /* ----- Buttons (reusable across Login, Sales, Inventory, etc.) ----- */
        '.btn-base': {
          '@apply inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed': {},
        },
        '.btn-primary': {
          '@apply btn-base bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500': {},
        },
        '.btn-secondary': {
          '@apply btn-base bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-500': {},
        },
        '.btn-ghost': {
          '@apply btn-base text-red-600 hover:bg-red-50 focus:ring-red-500': {},
        },
        '.btn-outline': {
          '@apply btn-base border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500': {},
        },
        '.btn-primary-sm': {
          '@apply btn-primary px-2 py-1.5 text-xs': {},
        },
        '.btn-primary-lg': {
          '@apply btn-primary px-4 py-3 text-base': {},
        },
        '.btn-primary-block': {
          '@apply btn-primary w-full': {},
        },
        /* ----- Cards ----- */
        '.card-base': {
          '@apply bg-white border border-gray-200 rounded-lg p-4': {},
        },
        '.card-elevated': {
          '@apply bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow': {},
        },
        '.card-header': {
          '@apply font-medium text-gray-900 mb-3': {},
        },
        /* ----- Form inputs ----- */
        '.input-base': {
          '@apply w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500': {},
        },
        /* ----- Alerts ----- */
        '.alert-warning': {
          '@apply text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2': {},
        },
        '.alert-error': {
          '@apply text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2': {},
        },
      })
    },
  ],
  daisyui: {
    themes: ["coffee"]
  }
}