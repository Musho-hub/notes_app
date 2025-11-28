"use client";

import { X } from "lucide-react";

interface TagChipProps {
    label: string;
    selected?: boolean;
    onClick?: () => void;
    onDelete?: () => void;
}

export function TagChip({ label, selected = false, onClick, onDelete }: TagChipProps) {
    return (
        <div className="flex items-center gap-1">
            {/* --- Chip itself --- */}
            <div
                role="button"
                tabIndex={0}
                onClick={onClick}
                onKeyDown={(e) => {
                    if (e.key === "Enter") onClick?.();
                }}
                className={`
                    inline-flex items-center px-3 py-1 rounded-full border text-sm cursor-pointer
                    transition-all duration-200 select-none

                    ${selected
                        ? "bg-neutral text-white border-neutral"
                        : "bg-card-border/30 border-card-border text-text hover:bg-neutral-hover hover:border-neutral"
                    }
                `}
            >
                {label}
            </div>

            {/* --- Delete button --- */}
            {onDelete && (
                <button
                    type="button"
                    onClick={onDelete}
                    className="
                        p-0.5 rounded-full 
                        hover:bg-danger-hover 
                        transition
                        flex items-center justify-center
                    "
                >
                    <X
                        size={14}
                        className={selected ? "text-white" : "text-text opacity-70"}
                    />
                </button>
            )}
        </div>
    );
}
