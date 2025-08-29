// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // This line tells Tailwind to scan all JS, JSX, TS, TSX files in your src folder
    "./public/index.html"        // Also scan your public HTML file
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}