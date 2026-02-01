/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'dengue-green': '#5EA244',
        'dark-green': '#1F4F42',
        'light-bg': '#E0E7E9',
      }
    },
  },
  plugins: [],
}