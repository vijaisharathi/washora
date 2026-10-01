/**
 * ==============================================================================
 * WASHORA CUSTOMER FRONTEND — DESIGN SYSTEM TOKENS
 * Centralized Design Tokens for the District-Inspired Discovery Experience
 * ==============================================================================
 */

export const colors = {
  background: "#09090b", // Deep obsidian
  surface: {
    base: "#09090b",
    card: "#121216",
    container: "#18181f",
    hover: "#202028",
    highest: "#2a2a34",
    border: "rgba(255, 255, 255, 0.08)",
    borderHover: "rgba(139, 92, 246, 0.3)",
  },
  primary: {
    DEFAULT: "#8b5cf6", // WASHORA Electric Violet
    hover: "#7c3aed",
    light: "#a78bfa",
    container: "rgba(139, 92, 246, 0.15)",
    foreground: "#ffffff",
  },
  text: {
    primary: "#f8fafc",
    secondary: "#94a3b8",
    muted: "#64748b",
  },
  semantic: {
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
  },
} as const;

export const radius = {
  sm: "10px",
  md: "14px",
  lg: "18px",
  xl: "22px",
  hero: "26px",
  pill: "9999px",
} as const;

export const breakpoints = {
  mobile: "390px",
  tablet: "768px",
  desktop: "1280px",
  wide: "1536px",
} as const;

export const containerWidths = {
  narrow: "768px",
  medium: "1024px",
  standard: "1280px",
} as const;
