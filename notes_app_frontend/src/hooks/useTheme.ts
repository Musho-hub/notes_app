"use client";

import { useEffect, useState } from "react";

export type Theme = "light" | "dark" | "pastel" | "system";

export function useTheme() {
    const [theme, setTheme] = useState<Theme>("dark");

    useEffect(() => {
        const saved = localStorage.getItem("theme");
        if (saved) setTheme(saved as Theme);
    }, []);

    useEffect(() => {
        const root = document.documentElement;

        if (theme === "system") {
            const media = window.matchMedia("(prefers-color-scheme: dark");
            const applySystem = () =>
                root.setAttribute("data-theme", media.matches ? "dark" : "light");
            applySystem();
            media.addEventListener("change", applySystem);
            return () => media.removeEventListener("change", applySystem);
        }

        root.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme])

    return { theme, setTheme };
}