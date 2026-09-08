/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#050505',
        surface: '#3D2B1F',
        elevated: '#4A5568',
        border: '#4A5568',
        accent: '#6B4226',
        'accent-hover': '#A0644A',
        success: '#38A169',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
