/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-navy': '#003087',
        'brand-cyan': '#00AEEF',
        'brand-green': '#78BE20',
        'brand-light': '#F0F4FF',
        'brand-slate': '#4A5568',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
