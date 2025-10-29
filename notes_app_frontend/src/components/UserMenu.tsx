"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDown, Check } from "lucide-react";

// === HOOKS === //
import { useTheme } from "@/hooks/useTheme";

// === TYPES === //
import type { UserMenuProps } from "@/types/components";

export function UserMenu({ username, onLogout}: UserMenuProps) {
    const { theme, setTheme } = useTheme();
    const themes = ["light", "dark", "pastel", "system"] as const;

    return(
        <Menu as="div" className="relative inline-block text-left">
            {/* === Toggle button === */}
            {({open}) => (
            <>
            <MenuButton className={`
                    group flex items-center gap-2
                    p-0.5 pl-2 border rounded-lg cursor-pointer 
                    bg-card text-text hover:border-neutral 
                    focus:outline-0 transition ${open ? "border-neutral" : ""}
                `}
            >
                {/* Avatar placeholder (first letter of username) */}
                <ChevronDown size={16} className={`transition-transform duration-200 group-hover:rotate-[0deg] ${open ? "rotate-0 text-success" : "rotate-90 text-text"}`} />
                <span className="font-medium text-text hidden sm:inline">{username}</span>
                <div className="
                        w-8 h-8 rounded-md bg-neutral text-white 
                        flex items-center justify-center font-semibold uppercase
                    "
                >
                    {username[0]}
                </div>
            </MenuButton>

            {/* === Dropdown content === */}
            <MenuItems transition anchor="bottom end" className="
                    absolute left-0 mt-2 min-w-[12rem] max-w-[18rem] origin-top-right
                    rounded-xl border bg-card/95 backdrop-blur-sm text-text shadow-xl 
                    focus:outline-none z-[9999] 
                    transition duration-150 ease-in-out
                    data-[closed]:opacity-0 data-[closed]:scale-95 
                    data-[enter]:opacity-100 data-[enter]:scale-100
                "
            >
                <div className="p-2">
                    <p className="text-xs text-text/60 px-2 mb-1 uppercase tracking-wide">Theme</p>
                    {themes.map((t) => (
                        <MenuItem key={t}>
                            <button 
                                onClick={() => setTheme(t)} 
                                data-selected={theme === t ? "true" : undefined}
                                className="
                                        w-full flex items-center justify-between 
                                        px-3 py-1.5 rounded-md text-sm capitalize transition 
                                        data-[active]:bg-neutral-hover/30 
                                        data-[selected]:bg-neutral/30 data-[selected]:text-white
                                    "
                            >
                                <span>{t}</span>
                                {theme === t && <Check size={14} className="opacity-80 text-success" />}
                            </button>
                        </MenuItem>
                    ))}
                    <div className="border-t my-2" />

                    <MenuItem>
                        <button onClick={onLogout} className="
                                w-full text-left px-3 py-1.5 
                                rounded-md text-sm text-danger 
                                hover:bg-danger-hover transition
                            "
                        >
                            Logout
                        </button>
                    </MenuItem>
                </div>
            </MenuItems>
            </>
            )}
        </Menu>
    );
}