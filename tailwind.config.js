/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'icc-gold': '#9e812f',
        'icc-cream': '#faf9f7',
        'icc-dark': '#1a1a1a',
      },
    },
  },
  plugins: [],
};
