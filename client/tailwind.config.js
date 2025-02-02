/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors : {
        primary: '#1E1E2E',
        secondary: '#B0BEC5'
      }
    },
  },
  plugins: ['tailwind-scrollbar'],
}
