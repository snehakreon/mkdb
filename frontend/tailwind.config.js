/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mk-red': {
          DEFAULT: '#ED1C24',
          50: '#FEF2F2',
          100: '#FEE2E2',
          600: '#C71920',
          700: '#A11016',
        },
        'mk-gray': {
          DEFAULT: '#4D4D4D',
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          600: '#6B7280',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        // Keep primary for admin panel
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        montserrat: ['Montserrat', 'Century Gothic', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
