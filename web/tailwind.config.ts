import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        secondary: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce",
          800: "#6b21a8",
          900: "#581c87",
        },
        accent: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
        },
        surface: {
          DEFAULT: "#ffffff",
          dark: "#0b1220",
          card: "#f8fafc",
          "card-dark": "#111a2e",
        },
      },
      fontFamily: {
        // Inter resolves Latin glyphs; Bangla glyphs fall through to Noto Sans
        // Bengali so mixed en/bn content always renders correctly.
        sans: [
          "var(--font-sans)",
          "var(--font-bengali)",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 3px rgb(15 23 42 / 0.06), 0 8px 24px -12px rgb(15 23 42 / 0.12)",
        "card-hover": "0 4px 8px rgb(15 23 42 / 0.08), 0 16px 40px -12px rgb(37 99 235 / 0.25)",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
