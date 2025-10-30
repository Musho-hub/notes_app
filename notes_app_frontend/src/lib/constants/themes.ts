export const THEMES = ["light", "dark", "pastel", "system"] as const;

export type Theme = (typeof THEMES)[number];

export const THEME_COLORS: Record<Theme, string> = {
    light: "#ffffff",
    dark: "#111827",
    pastel: "#f472b6",
    system: "#9ca3af",
};