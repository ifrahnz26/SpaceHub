/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#E76F1E",
        dark: "#201C47",
        accent: "#9E3B63",
        danger: "#ED3B5A",
        white: "#FFFFFF",
      },
    },
  },
  plugins: [],
};
