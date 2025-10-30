"use client";

import { useEffect, useState } from "react";

// -= THEME CONSTANTS =- //
import { Theme } from "@/lib/constants/themes";

export function useTheme() {
    // === State === //
    const [theme, setTheme] = useState<Theme>("dark"); // Holds the current active theme - Default "dark"

    // === Effect: Load saved theme from localStorage on mount === //
    useEffect(() => {
        const saved = localStorage.getItem("theme"); // Check if a previously chosen theme is stored in localStorage
        if (saved) setTheme(saved as Theme); // If saved theme found → apply it to state
    }, []); // Empty dependency array = runs only once when component mounts

    // === Effect: Apply theme to <html> and persist it === //
    useEffect(() => {
        const root = document.documentElement; // Select <html> to apply data attributes used by Tailwind

        // --- System theme handling --- //
        if (theme === "system") {
            const media = window.matchMedia("(prefers-color-scheme: dark"); // Detects whether the user's OS prefers dark mode

            // Apply light/dark automatically based on system preferences
            const applySystem = () =>
                root.setAttribute("data-theme", media.matches ? "dark" : "light");
            applySystem(); // Apply system preference on mount
            media.addEventListener("change", applySystem); // Listen for system theme changes (OS switches)

            // Cleanup: remove listener when component unmounts or theme changes.
            return () => media.removeEventListener("change", applySystem);
        }

        // --- Explicit theme handling --- //
        // User selects theme (light, dark...) - set "data-theme" to match selected theme
        root.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme); // Save selected theme so it persists between page reloads
    }, [theme]) // Re-run on theme change

    // === Return API === //
    return { theme, setTheme }; // Theme and setter for components (dropdown)
}