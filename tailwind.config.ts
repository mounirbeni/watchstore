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
        // Brand Gold — #C9A86A primary
        gold: {
          50:  "#faf6ee",
          100: "#f2e8d4",
          200: "#e7d3a9",
          300: "#ddc28c",
          400: "#d4a85c", // hover / active
          500: "#c9a86a", // primary accent
          600: "#b08f50",
          700: "#8c7140",
          800: "#6a5530",
          900: "#483a20",
        },
        // Store palette — white + dark gray + gold only
        luxury: {
          black:  "#FFFFFF",  // main background
          dark:   "#F7F7F5",  // soft section background
          card:   "#FFFFFF",  // card background
          border: "#E8E8E6",  // light hairline border
          muted:  "#9CA3AF",  // tertiary text
          light:  "#6B7280",  // secondary text
          white:  "#1A1A1A",  // primary text (dark gray)
        },
      },
      fontFamily: {
        sans:  ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        mono:  ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        "gold-glow":    "0 0 30px rgba(201, 168, 106, 0.18)",
        "gold-glow-sm": "0 0 16px rgba(201, 168, 106, 0.14)",
        "card":         "0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover":   "0 4px 12px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06)",
        "header":       "0 1px 0 #E8E8E6",
      },
      backgroundImage: {
        "premium-gradient": "linear-gradient(135deg, #FAFAF9 0%, #F2F2F0 100%)",
      },
      transitionTimingFunction: {
        brand:   "cubic-bezier(0.16, 1, 0.3, 1)",
        curtain: "cubic-bezier(0.83, 0, 0.17, 1)",
      },
      animation: {
        "fade-in":    "fadeIn 0.3s ease-in-out",
        "slide-up":   "slideUp 0.4s ease-out",
        "shimmer":    "shimmer 1.5s infinite",
        "marquee":    "marquee 32s linear infinite",
        "float-slow": "floatSlow 7s ease-in-out infinite",
        "pulse-ring": "pulseRing 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "tick":       "tick 60s steps(60) infinite",
      },
      keyframes: {
        fadeIn:  { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        shimmer: { from: { backgroundPosition: "-200% 0" }, to: { backgroundPosition: "200% 0" } },
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-100%)" } },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-10px)" },
        },
        pulseRing: {
          "0%":        { transform: "scale(0.9)", opacity: "0.6" },
          "70%, 100%": { transform: "scale(1.6)", opacity: "0" },
        },
        tick: { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } },
      },
    },
  },
  plugins: [],
};

export default config;
