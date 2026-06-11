import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        fab: {
          nav:         "#0C1A2E",
          navHover:    "#162840",
          navActive:   "#1E3A5F",
          navBorder:   "#1A3050",
          brand:       "#2563EB",
          brandHover:  "#1D4ED8",
          brandLight:  "#EFF6FF",
          bg:          "#F1F5F9",
          card:        "#FFFFFF",
          border:      "#E2E8F0",
          text:        "#0F172A",
          muted:       "#64748B",
          positive:    "#10B981",
          warning:     "#F59E0B",
          danger:      "#EF4444",
          info:        "#3B82F6",
        }
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif"
        ]
      },
      boxShadow: {
        card: "0 1px 4px 0 rgb(0 0 0 / 0.04)",
        "card-hover": "0 4px 12px 0 rgb(0 0 0 / 0.08), 0 1px 3px -1px rgb(0 0 0 / 0.04)",
        modal: "0 20px 60px -10px rgb(0 0 0 / 0.3)",
      },
      animation: {
        "slide-in": "slideIn 0.15s ease-out",
        "fade-in":  "fadeIn 0.2s ease-out",
      },
      keyframes: {
        slideIn: {
          from: { opacity: "0", transform: "translateY(-4px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
