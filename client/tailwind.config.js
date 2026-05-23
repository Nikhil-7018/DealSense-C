/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#0a0f1a',
          900: '#0f172a',
          800: '#1e293b',
        },
        accent: {
          DEFAULT: '#22d3ee',
          dim: '#0891b2',
        },
        surface: '#111827',
      },
    },
  },
  plugins: [],
};
