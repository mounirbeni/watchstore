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
        // Luxury Gold — warm champagne gold (#C9A86A primary / #D8B67A hover)
        gold: {
          50:  "#faf6ee",
          100: "#f2e8d4",
          200: "#e7d3a9",
          300: "#ddc28c",
          400: "#d8b67a", // Rich Gold — hover / active
          500: "#c9a86a", // Luxury Gold — primary accent
          600: "#b08f50",
          700: "#8c7140",
          800: "#6a5530",
          900: "#483a20",
        },
        luxury: {
          black:  "#0a0a0a", // Deep Black — primary background
          dark:   "#161616", // Charcoal Black — secondary background
          card:   "#1c1c1c", // Dark Graphite — cards & surfaces
          border: "#373126", // Gold-tinted graphite hairline (works with opacity modifiers)
          muted:  "#8a8a8a", // tertiary text
          light:  "#b8b8b8", // Soft Silver — secondary text
          white:  "#ffffff", // Pure White — primary text
        },
      },
      fontFamily: {
        sans:   ["var(--font-inter)", "system-ui", "sans-serif"],
        serif:  ["var(--font-playfair)", "Georgia", "serif"],
        mono:   ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        "gold-glow":    "0 0 30px rgba(201, 168, 106, 0.20)",
        "gold-glow-sm": "0 0 16px rgba(201, 168, 106, 0.18)",
      },
      backgroundImage: {
        "premium-gradient": "linear-gradient(135deg, #0a0a0a 0%, #161616 100%)",
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
