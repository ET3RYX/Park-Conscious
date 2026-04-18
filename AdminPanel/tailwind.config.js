/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBackground: {
          950: '#020617', // Deeper slate
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        },
        primary: {
          500: '#0ea5e9', // Clean Sky Blue
          600: '#0284c7',
        },
        secondary: {
          500: '#64748b',
          400: '#94a3b8',
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        inter: ['"Inter"', 'sans-serif'],
        outfit: ['"Outfit"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
