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
          900: '#090a0f',
          800: '#151720',
          700: '#1e212b',
          600: '#282c37',
        },
        premier: {
          400: '#8b5cf6',
          500: '#7c3aed',
          700: '#5b21b6',
        },
        vibrantBlue: '#3b82f6',
        accentYellow: '#f5df4d'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(circle at top right, rgba(139, 92, 246, 0.15), transparent 40%), radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.15), transparent 40%)',
      }
    },
  },
  plugins: [],
}
