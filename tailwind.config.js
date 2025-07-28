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
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        mono: [
          '"SF Mono"',
          "Monaco",
          '"Cascadia Code"',
          '"Roboto Mono"',
          "Consolas",
          '"Liberation Mono"',
          "monospace",
        ],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.4" }],
        sm: ["0.875rem", { lineHeight: "1.5" }],
        base: ["1rem", { lineHeight: "1.6" }],
        lg: ["1.125rem", { lineHeight: "1.7" }],
        xl: ["1.25rem", { lineHeight: "1.7" }],
        "2xl": ["1.5rem", { lineHeight: "1.6" }],
        "3xl": ["1.875rem", { lineHeight: "1.5" }],
        "4xl": ["2.25rem", { lineHeight: "1.4" }],
        "5xl": ["3rem", { lineHeight: "1.3" }],
        "6xl": ["3.75rem", { lineHeight: "1.2" }],
        "7xl": ["4.5rem", { lineHeight: "1.1" }],
        "8xl": ["6rem", { lineHeight: "1.1" }],
        "9xl": ["8rem", { lineHeight: "1" }],
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
        144: "36rem",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)",
        glow: "0 0 20px rgba(37, 99, 235, 0.3)",
        "glow-strong": "0 0 40px rgba(37, 99, 235, 0.4)",
        colored:
          "0 10px 25px -5px rgba(37, 99, 235, 0.1), 0 8px 10px -6px rgba(37, 99, 235, 0.1)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        shimmer: "shimmer 1.5s infinite",
        gradient: "gradient-shift 3s ease infinite",
        "slide-up": "slide-up 0.6s ease-out",
        "slide-down": "slide-down 0.6s ease-out",
        "fade-in": "fade-in 0.8s ease-out",
        "scale-in": "scale-in 0.4s ease-out",
        "bounce-in": "bounce-in 0.6s ease-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(37, 99, 235, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(37, 99, 235, 0.6)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "bounce-in": {
          "0%": { opacity: "0", transform: "scale(0.3)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
        "out-circ": "cubic-bezier(0.08, 0.82, 0.17, 1)",
      },
      screens: {
        xs: "475px",
        "3xl": "1600px",
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
