/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Syne', 'DM Sans', 'sans-serif'],
      },
      colors: {
        ink: '#141414',
        canvas: '#F7F2EA',
        coral: { DEFAULT: '#FB7B0E', light: '#F8AA4A', dark: '#E04E2E' },
        neon: { DEFAULT: '#67d449', light: '#D4FF7A', dark: '#8FD600' },
        violet: { DEFAULT: '#da7ae1', light: '#A78BFA', dark: '#6D28D9' },
        sun: { DEFAULT: '#fef96e', light: '#FFE082', dark: '#E6B800' },
        teal: { DEFAULT: '#0FAD72', light: '#09C480', dark: '#083D33' },
        pink: { DEFAULT: '#fb58aa', light: '#FFC1DD', dark: '#E5729F' },
        sky: { DEFAULT: '#5B8DEF', light: '#8AAEF5', dark: '#3E6BC9' },
        surface: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
        },
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
      borderRadius: {
        bento: '1.25rem',
        'bento-lg': '1.75rem',
        'bento-sm': '0.875rem',
      },
      spacing: {
        bento: '0.75rem',     
        'bento-md': '1rem',
        'bento-lg': '1.25rem',
      },
      
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        bento: '0 1px 0 rgba(0,0,0,0.04), 0 8px 24px -8px rgba(0,0,0,0.12)',
        'bento-hover': '0 2px 0 rgba(0,0,0,0.04), 0 16px 40px -12px rgba(0,0,0,0.18)',
      },
      transitionDuration: { 250: '250ms' },
    },
  },
  plugins: [],
};
