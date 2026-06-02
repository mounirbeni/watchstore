import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  "#fdfbf0",
          100: "#faf3d0",
          200: "#f5e59a",
          300: "#edd45f",
          400: "#e5c132",
          500: "#c9a227",
          600: "#a67c20",
          700: "#7e5d1b",
          800: "#5a4118",
          900: "#3c2c12",
        },
        luxury: {
          black:  "#0a0a0a",
          dark:   "#111111",
          card:   "#1a1a1a",
          border: "#2a2a2a",
          muted:  "#6b6b6b",
          light:  "#d4d4d4",
          white:  "#f5f5f0",
        },
      },
      fontFamily: {
        sans:   ["var(--font-inter)", "system-ui", "sans-serif"],
        serif:  ["var(--font-playfair)", "Georgia", "serif"],
        mono:   ["var(--font-mono)", "monospace"],
      },
      animation: {
        "fade-in":    "fadeIn 0.3s ease-in-out",
        "slide-up":   "slideUp 0.4s ease-out",
        "shimmer":    "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn:  { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        shimmer: { from: { backgroundPosition: "-200% 0" }, to: { backgroundPosition: "200% 0" } },
      },
    },
  },
  plugins: [],
};

export default config;
