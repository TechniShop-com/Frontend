/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        techni: {
          navy: '#0F172A',
          slate: '#1E293B',
          green: '#10B981',
          'green-light': '#34D399',
          cyan: '#06B6D4',
          'cyan-light': '#38BDF8',
          purple: '#8B5CF6',
          dark: '#0B0F19',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
