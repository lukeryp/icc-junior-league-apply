/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'icc-green': '#00af51',
        'icc-yellow': '#f4ee19',
        'icc-black': '#0d0d0d',
      },
    },
  },
  plugins: [],
};
