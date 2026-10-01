/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090b",
        surface: {
          DEFAULT: "#121216",
          dim: "#0c0c0f",
          bright: "#282832",
          variant: "#1c1c22",
          lowest: "#060608",
          low: "#0e0e12",
          card: "#141418",
          container: "#18181f",
          high: "#202028",
          highest: "#2a2a34",
        },
        primary: {
          DEFAULT: "#8b5cf6",
          hover: "#7c3aed",
          light: "#a78bfa",
          fixed: "#ddd6fe",
          dim: "#a78bfa",
          container: "rgba(139, 92, 246, 0.15)",
          foreground: "#ffffff",
        },
        "on-primary": {
          DEFAULT: "#ffffff",
          container: "#ddd6fe",
          fixed: "#2e1065",
          variant: "#4c1d95",
        },
        secondary: {
          DEFAULT: "#94a3b8",
          container: "#1e293b",
          foreground: "#f8fafc",
        },
        "on-secondary": {
          DEFAULT: "#0f172a",
          container: "#cbd5e1",
        },
        tertiary: {
          DEFAULT: "#cbd5e1",
          container: "#334155",
          foreground: "#0f172a",
        },
        error: {
          DEFAULT: "#f87171",
          container: "rgba(239, 68, 68, 0.15)",
          foreground: "#ffffff",
        },
        "on-error": {
          DEFAULT: "#ffffff",
          container: "#fecaca",
        },
        outline: {
          DEFAULT: "#334155",
          variant: "rgba(255, 255, 255, 0.08)",
        },
        "on-surface": {
          DEFAULT: "#f8fafc",
          variant: "#94a3b8",
          muted: "#64748b",
        },
        "on-background": "#f8fafc",
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        sm: "0.375rem",
        md: "0.625rem",
        lg: "0.875rem",
        xl: "1.125rem",
        "2xl": "1.375rem",
        "3xl": "1.75rem",
        full: "9999px",
        pill: "9999px",
      },
      boxShadow: {
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
        "card-hover": "0 8px 30px -4px rgba(0, 0, 0, 0.6), 0 0 15px -3px rgba(139, 92, 246, 0.15)",
        glow: "0 0 25px -5px rgba(139, 92, 246, 0.3)",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
        "3xl": "64px",
      },
      fontFamily: {
        sans: ["Geist", "Inter", "system-ui", "-apple-system", "sans-serif"],
        headline: ["Geist", "Inter", "sans-serif"],
        body: ["Geist", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
