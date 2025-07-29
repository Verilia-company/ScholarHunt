/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "media", // Follows system preference
  theme: {
    extend: {
      colors: {
        // Professional Brand Colors
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#2563eb", // Primary
          600: "#1d4ed8",
          700: "#1e40af",
          800: "#1e3a8a",
          900: "#1e3a8a",
          950: "#172554",
        },
        secondary: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#7c3aed", // Secondary
          600: "#6d28d9",
          700: "#5b21b6",
          800: "#4c1d95",
          900: "#4c1d95",
          950: "#2e1065",
        },
        accent: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#059669", // Accent
          600: "#047857",
          700: "#065f46",
          800: "#064e3b",
          900: "#064e3b",
          950: "#022c22",
        },
        // Enhanced Grays
        gray: {
          50: "#fafbfc",
          100: "#f4f6f8",
          200: "#eef2f6",
          300: "#e2e8f0",
          400: "#cbd5e1",
          500: "#94a3b8",
          600: "#64748b",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#0a0f1c",
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms")({
      strategy: "class",
    }),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
  ],
};
