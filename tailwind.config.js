/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#09090B',
        surface: '#18181B',
        elevated: '#27272A',
        border: '#3F3F46',
        accent: '#A78BFA',
        'accent-hover': '#C4B5FD',
        success: '#34D399',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
