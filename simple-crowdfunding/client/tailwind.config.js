/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#0F172A",
          primary: "#38BDF8",
          secondary: "#94A3B8",
          accent: "#22D3EE",
        }
      }
    },
  },
  plugins: [],
}
