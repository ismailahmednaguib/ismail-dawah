import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
          950: "#083344",
        },
        gold: {
          100: "#fef9c3",
          300: "#fde047",
          400: "#facc15",
          500: "#d4af37",
          600: "#b8962e",
          700: "#a16207",
        },
        night: {
          700: "#1e3a5f",
          800: "#0f2233",
          900: "#0a1628",
          950: "#060d1a",
        },
      },
      fontFamily: {
        cairo: ["var(--font-cairo)", "sans-serif"],
        amiri: ["var(--font-amiri)", "serif"],
        quran: ["var(--font-scheherazade)", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;