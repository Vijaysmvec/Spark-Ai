import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep Forest-Emerald Obsidian Foundation (Reference Image Palette)
        space: {
          950: "#03110B",
          900: "#061C13",
          800: "#0A291C",
          700: "#113B2A",
        },
        // Map 'violet' utility tokens -> Imperial Champagne Gold (#D4AF37 / #EAB308 / #FACC15)
        violet: {
          200: "#FEF08A",
          300: "#FDE047",
          400: "#FACC15",
          500: "#EAB308",
          600: "#CA8A04",
          700: "#A16207",
          950: "#3B2506",
          glow: "#FACC15",
          deep: "#CA8A04",
        },
        // Map 'indigo' utility tokens -> Rich Warm Gold-Amber
        indigo: {
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
        },
        // Map 'cyan' utility tokens -> Lush Imperial Emerald (#10B981 / #34D399 / #059669)
        cyan: {
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          950: "#022C22",
          glow: "#10B981",
          deep: "#047857",
        },
        // Tint slate borders/surfaces toward deep emerald-jade & warm cream text
        slate: {
          100: "#F7F9F4",
          200: "#E6ECE0",
          300: "#C5D4C0",
          400: "#8FA998",
          500: "#5E7A68",
          700: "#18422E",
          800: "#0F2E1F",
          900: "#071B12",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-space)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "cosmic-grid":
          "linear-gradient(to right, rgba(212, 175, 55, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(16, 185, 129, 0.06) 1px, transparent 1px)",
        "aurora-radial":
          "radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.24), rgba(212, 175, 55, 0.12) 45%, rgba(3, 17, 11, 0) 75%)",
      },
      boxShadow: {
        "glow-violet":
          "0 0 28px -4px rgba(234, 179, 8, 0.45), inset 0 1px 0 0 rgba(254, 240, 138, 0.35)",
        "glow-cyan":
          "0 0 28px -4px rgba(16, 185, 129, 0.5), inset 0 1px 0 0 rgba(167, 243, 208, 0.3)",
        "glass-inset": "inset 0 1px 0 0 rgba(253, 224, 71, 0.22)",
      },
    },
  },
  plugins: [],
};

export default config;
