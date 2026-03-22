/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        darkBackground: {
          50: "#edf1fc",
          100: "#d3d4e1",
          200: "#b6b8c9",
          300: "#989bb2",
          400: "#7c7f9b",
          500: "#636582",
          600: "#4c4f66",
          700: "#1a1c2c", // Adjusted for better contrast
          800: "#0a0c1a",
          900: "#040b17", // Primary Bg
        },
        premier: {
          50: "#f5afff",
          100: "#e989ff",
          200: "#db61ff",
          300: "#cc32ff",
          400: "#b900f9",
          500: "#a900e5",
          600: "#9900d1",
          700: "#8b2fdf", // Primary Accent
          800: "#7b26c6",
          900: "#6a1ead",
        },
        vibrantBlue: {
          DEFAULT: "#4e8ef7",
          light: "#70a5ff",
          dark: "#2b74e2",
        },
        accentYellow: {
          DEFAULT: "#fdf16e",
        },
      },
    },
  },
  plugins: [],
};
