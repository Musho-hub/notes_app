"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// -= API =- //
import api, { fetchNotes, deleteNote, updateNote } from "@/lib/api";

// -= TYPES =- //
import type { Note } from "@/lib/types";

/**
 * useNotes()
 * ---------------------------------------------------------
 * Hook that manages:
 * - Fetching all notes for the authenticated user
 * - Creating notes (with optional tags)
 * - Editing notes (title, content, tags)
 * - Deleting notes
 *
 * Works with HttpOnly JWT cookies (authentication handled server-side).
 * Automatically redirects to `/login` if authentication fails.
 */
export function useNotes() {
  // ---------------------------------------------------------------------------
  // Local state
  // ---------------------------------------------------------------------------
  const [notes, setNotes] = useState<Note[]>([]); // All notes for the current user
  const [error, setError] = useState(""); // Error message (if any)
  const [loading, setLoading] = useState(false); // Loading indicator for API actions

  const router = useRouter();

  // ---------------------------------------------------------------------------
  // Load notes on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    /**
     * Fetch all notes when the page loads.
     * If authentication fails (401/403), redirect to `/login`.
     */
    async function loadNotes() {
      setLoading(true); // Show loading spinner during fetch
      try {
        // Backend automatically sends JWT cookies → no need for headers
        const data = await fetchNotes();
        setNotes(data); // Save notes to state
      } catch (err: any) {
        // Redirect user if auth cookie is missing or expired
        if (err.response?.status === 401 || err.response?.status === 403) {
          router.push("/login");
        } else {
          // Handle network/server errors
          setError("Failed to load notes");
        }
      } finally {
        setLoading(false);
      }
    }

    loadNotes(); // Initial mount
  }, [router]);

  // ---------------------------------------------------------------------------
  // Create a new note (title, content, tags)
  // ---------------------------------------------------------------------------
  async function createNote(title: string, content: string, tags: number[]) {
    /**
     * Sends a POST request to create a new note.
     * Includes selected tag IDs in the payload.
     * On success, prepends the new note to local state.
     */
    try {
      const res = await api.post<Note>("notes/", {
        title,
        content,
        tags,
      });

      // Add new note to top of list
      setNotes((prev) => [res.data, ...prev]);
    } catch (err: any) {
      // Auto-redirect if authentication failed
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push("/login");
      } else if (err.response?.status === 400) {
        // Example: user tried assigning a tag owned by someone else (blocked by backend)
        setError("Invalid tag selection");
      } else {
        setError("Failed to create note");
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Save updates to an existing note (title, content, tags)
  // ---------------------------------------------------------------------------
  async function saveEdit(note: Note) {
    /**
     * Sends a PATCH request to update an existing note.
     * The Note object should already contain updated:
     * - title
     * - content
     * - tags (array of tag IDs)
     *
     * The updated note is then merged into local state.
     */
    try {
      const updated = await updateNote(note.id, {
        title: note.title,
        content: note.content,
        tags: note.tags,
      });

      // Replace note in local state
      setNotes((prev) =>
        prev.map((n) => (n.id === updated.id ? updated : n))
      );
    } catch (err: any) {
      // Handle expired/missing auth cookie
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push("/login");
      } else if (err.response?.status === 400) {
        setError("Invalid tag selection");
      } else {
        setError("Failed to edit note");
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Delete a note
  // ---------------------------------------------------------------------------
  async function removeNote(id: number) {
    /**
     * Sends a DELETE request to remove a note.
     * Also removes the note from UI state.
     */
    try {
      await deleteNote(id);

      // Remove deleted note from local state
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err: any) {
      // If user is no longer authenticated
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push("/login");
      } else {
        setError("Failed to delete note");
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Return everything the UI needs
  // ---------------------------------------------------------------------------
  return {
    notes,      // All notes
    error,      // Error message
    loading,    // Is an API request running?
    createNote, // Create a new note
    saveEdit,   // Edit existing note
    removeNote, // Delete a note
    setNotes,   // Manually update notes (optional)
    setError,   // Manually clear/set errors
  };
}
