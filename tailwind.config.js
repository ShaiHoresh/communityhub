/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./docs/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#7C3AED",   // purple from logo
        secondary: "#2563EB", // blue from logo
        accent: "#111827",    // dark accent (dots)
      },
    },
  },
  plugins: [],
};

