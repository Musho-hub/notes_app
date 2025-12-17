"use client";

import { useState } from "react";

// -= TYPES =- //
import type { Tag } from "@/lib/types";

// -= HOOKS =- //
import { useValidatedInput } from "@/hooks/useValidatedInput";

// -= COMPONENTS =- //
import { TagChip } from "./TagChip";

interface TagSelectorProps {
  tags: Tag[];                                // All user tags
  selected: number[];                         // Selected tag IDs
  onToggle: (id: number) => void;             // Add/remove tag
  onDelete?: (id: number) => void;            // Optional delete action
  onCreate?: (name: string) => Promise<void>; // Optional create action
}

export function TagSelector({
  tags,
  selected,
  onToggle,
  onDelete,
  onCreate,
}: TagSelectorProps) {
  const [showInput, setShowInput] = useState(false); // Controls if the "new tag" input is visible
  // const [newTag, setNewTag] = useState("");          // Holds the name of the new tag being typed
  // const [error, setError] = useState("");            // Tag creation error message

  const input = useValidatedInput((value) => {
    const trimmed = value.trim();

    if (!trimmed) return null;

    const exists = tags.some(
      (t) => t.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (exists) return "Tag allready exists";

    return null;
  });

  // Handle creation of a new tag
  async function handleCreate() {
    if (!input.isValid) return;

    try {
      await onCreate?.(input.trimmed);
      input.reset();
      setShowInput(false);
    } catch {
      input.setError("Failed to create tag");
    }
  }

  return (
    <div className="space-y-2">
      {/* === Tag list - Displays chips for each tag - Shows "Add tag" button ONLY when showInput === false */}
      <div className="flex flex-wrap gap-2">
        {/* --- Existing tags rendered as chips --- */}
        {tags.map((tag) => (
          <TagChip
            key={tag.id}
            label={tag.name}
            selected={selected.includes(tag.id)}
            onClick={() => onToggle(tag.id)}
            onDelete={onDelete ? () => onDelete(tag.id) : undefined}
          />
        ))}
        {/* --- Add tag button --- */}
        {!showInput && onCreate && (
          <button
            type="button"
            onClick={() => setShowInput(true)}
            className="
              px-5 py-2 border rounded-lg cursor-pointer
              hover:bg-green-500/25 hover:border-green-500 
              transition duration-300 
              focus:outline-0 focus:border-green-500 focus:bg-green-500/25
            "
          >
            Add tag
          </button>
        )}
        {/* === Tag creation input === */}
        {showInput && (
          <div className="flex gap-2 items-center">
            {/* --- Text input --- */}
            <input
              autoFocus
              type="text"
              value={input.value}
              onChange={(e) => input.onChange(e.target.value)}
              placeholder="New tag..."
              className="
              px-3 py-2 border rounded-lg
              bg-card text-text
              hover:bg-neutral-hover/20 hover:border-neutral
              transition duration-200
              focus:outline-none focus:ring-0 focus:border-neutral focus:bg-neutral-hover
            "
            />

            {/* --- Confirm button --- */}
            <button
              type="button"
              onClick={handleCreate}
              disabled={!input.isValid}
              className={`
              px-3 py-2 rounded-lg border text-text transition
              ${input.isValid
                ? "hover:bg-success-hover hover:border-success"
                : "opacity-50 cursor-not-allowed"
              }
            `}
            >
              Add
            </button>

            {/* --- Cancel button --- */}
            <button
              type="button"
              onClick={() => {
                input.reset();
                setShowInput(false);
              }}
              className="
              px-3 py-2 rounded-lg border text-text
              hover:bg-danger-hover hover:border-danger
              transition
            "
            >
              Cancel
            </button>

            {/* Error text */}
            {input.error && <p className="text-red-500 text-sm">{input.error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
