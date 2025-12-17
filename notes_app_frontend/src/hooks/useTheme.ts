"use client";

import { useEffect, useState } from "react";

// -= THEME CONSTANTS =- //
import { Theme } from "@/lib/constants/themes";

export function useTheme() {
    // === State === //
    const [theme, setTheme] = useState<Theme>("dark"); // Holds the current active theme (default: "dark")

    // === Effect: Load saved theme from localStorage on mount === //
    useEffect(() => {
        const saved = localStorage.getItem("theme"); // Read previously saved theme (if any)
        if (saved) setTheme(saved as Theme); // If found → apply to state
    }, []); // Empty deps = run once when component mounts

    // === Effect: Apply theme to <html> and persist it === //
    useEffect(() => {
        const root = document.documentElement; // Target <html> for Tailwind data-theme styling

        // --- System theme handling --- //
        if (theme === "system") {
            const media = window.matchMedia("(prefers-color-scheme: dark"); // Detect OS preference (dark mode?)

            // Apply light/dark automatically based on system preferences
            const applySystem = () =>
                root.setAttribute("data-theme", media.matches ? "dark" : "light");

            applySystem(); // Apply immediately on mount/theme change
            media.addEventListener("change", applySystem); // Update if OS theme changes

            // Cleanup: remove listener when component unmounts or theme changes.
            return () => media.removeEventListener("change", applySystem);
        }

        // --- Explicit theme handling --- //
        root.setAttribute("data-theme", theme); // Apply selected theme directly
        localStorage.setItem("theme", theme); // Persist selection across reloads
    }, [theme]) // Re-run on theme change

    // === Return API === //
    return { theme, setTheme }; // Theme value + setter for UI controls
}