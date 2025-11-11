export const colors = {
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
  },
  accent: {
    green: "#10b981",
    yellow: "#f59e0b",
    red: "#ef4444",
    purple: "#8b5cf6",
  },
  neutral: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    700: "#374151",
    900: "#111827",
  },
};

export const typography = {
  fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  heading: {
    xl: "2rem",
    lg: "1.5rem",
    md: "1.25rem",
  },
  body: {
    base: "1rem",
    sm: "0.875rem",
  },
};

export const layout = {
  maxWidth: "72rem", // 1152px
  gutter: "1.5rem",
};

export const tokens = {
  colors,
  typography,
  layout,
};

export type DesignTokens = typeof tokens;

