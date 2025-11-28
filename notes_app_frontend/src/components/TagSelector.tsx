"use client";

import { useState } from "react";
import { X } from "lucide-react";

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
  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState("");

  // Handle creation of a new tag
  async function handleCreate() {
    if (!newTag.trim()) return;

    try {
      await onCreate?.(newTag.trim());
      setNewTag("");
      setError("");
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
      </div>

      {/* --- New Tag Input --- */}
      {onCreate && (
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="New tag name..."
            className="
              px-3 py-1 border rounded-lg
              bg-card text-text
              hover:bg-neutral-hover/20 hover:border-neutral
              transition duration-200
              focus:outline-none focus:ring-2 focus:ring-neutral
            "
          />

          <button
            type="button"
            onClick={handleCreate}
            className="
              px-3 py-1 rounded-lg border bg-neutral text-white
              hover:bg-neutral-hover transition
            "
          >
            Add
          </button>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      )}
    </div>
  );
}
