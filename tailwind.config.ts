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
        brand: {
          50: "#eef6f4",
          100: "#d5eae5",
          200: "#aed6cd",
          300: "#7ebbaf",
          400: "#529c8f",
          500: "#388075",
          600: "#2b665e",
          700: "#26534d",
          800: "#224440",
          900: "#1f3a37",
          950: "#0e211f",
        },
        surface: "#f7f8f7",
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 3px rgba(16, 24, 40, 0.06), 0 1px 2px rgba(16, 24, 40, 0.04)",
        "card-hover":
          "0 4px 12px rgba(16, 24, 40, 0.08), 0 2px 4px rgba(16, 24, 40, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
