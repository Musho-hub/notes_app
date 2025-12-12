"use client";

import { useState } from "react";

// -= TYPES =- //
import type { Tag } from "@/lib/types";

// -= COMPONENTS =- //
import { TagChip } from "./TagChip";

interface TagSelectorProps {
  tags: Tag[];                                // All user tags
  selected: number[];                         // Selected tag IDs
  onToggle: (id: number) => void;             // Add/remove tag
  onDelete?: (id: number) => void;            // Optional delete action
  onCreate?: (name: string) => Promise<void>; // Optional create action
}

export function TagSelector({ tags, selected, onToggle, onDelete, onCreate, }: TagSelectorProps) {
  const [showInput, setShowInput] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState("");

  // Handle creation of a new tag
  async function handleCreate() {
    if (!newTag.trim()) return;

    try {
      await onCreate?.(newTag.trim());
      setNewTag("");
      setError("");
      setShowInput(false); // return to the "Add tag" button after creating
    } catch {
      setError("Failed to create tag");
    }
  }

  return (
    <div className="space-y-2">

      {/* --- Tags displayed as chips --- */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
            <TagChip
                key={tag.id}
                label={tag.name}
                selected={selected.includes(tag.id)}
                onClick={() => onToggle(tag.id)}
                onDelete={onDelete ? () => onDelete(tag.id) : undefined}
            />
        ))}
        {/* --- Show "+" button when input is hidden --- */}
        {onCreate && !showInput && (
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
      </div>

      {/* --- New Tag Input --- */}
      {onCreate && showInput && (
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="New tag name..."
            className="
              px-3 py-2 border rounded-lg
              bg-card text-text
              hover:bg-neutral-hover/20 hover:border-neutral
              transition duration-200
              focus:outline-none focus:ring-0 focus:border-neutral focus:bg-neutral-hover
            "
          />

          <button
            type="button"
            onClick={handleCreate}
            className="
              px-3 py-2 rounded-lg border text-text
              hover:bg-success-hover hover:border-success
              transition
            "
          >
            Add
          </button>

          <button
            type="button"
            onClick={() => {
              setShowInput(false);
              setNewTag("");
            }}
            className="
              px-3 py-2 rounded-lg border text-text
              hover:bg-danger-hover hover:border-danger
              transition
            "
          >
            Cancel
          </button>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      )}
    </div>
  );
}
