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
 * Manages user notes:
 * - Fetch all notes on mount
 * - Create notes (with optional tags)
 * - Edit notes (title, content, tags)
 * - Delete notes
 *
 * Uses HttpOnly JWT cookies (auth handled by backend).
 * Redirects to `/login` on 401/403 responses.
 */
export function useNotes() {
  // === State === //
  const [notes, setNotes] = useState<Note[]>([]); // All notes for the current user
  const [error, setError] = useState(""); // Error message (empty string = none)
  const [loading, setLoading] = useState(false); // Loading indicator for note requests

  const router = useRouter(); // Next router for auth redirects

  // === Effect: Load notes on mount === //
  useEffect(() => {
    async function loadNotes() {
      setLoading(true); // Start loading state

      try {
        const data = await fetchNotes(); // GET /notes/
        setNotes(data); // Store notes in state
      } catch (err: any) {
        // If auth is missing/expired → redirect to login
        if (err.response?.status === 401 || err.response?.status === 403) {
          router.push("/login");
        } else {
          setError("Failed to load notes"); // Generic fallback error
        }
      } finally {
        setLoading(false); // Stop loading (success or error)
      }
    }

    loadNotes(); // Run once on mount
  }, [router]);

  // === Action: Create a new note === //
  async function createNote(title: string, content: string, tags: number[]) {
    try {
      const res = await api.post<Note>("notes/", {
        title,
        content,
        tags,
      }); // POST /notes/

      setNotes((prev) => [res.data, ...prev]); // Prepend new note to top of list
    } catch (err: any) {
      // Auto-redirect if authentication failed
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push("/login"); // Not authenticated
      } else if (err.response?.status === 400) {
        setError("Invalid tag selection"); // Backend rejected tag IDs
      } else {
        setError("Failed to create note"); // Generic fallback error
      }
    }
  }

  // === Action: Save edits to an existing note === //
  async function saveEdit(note: Note) {
    try {
      const updated = await updateNote(note.id, {
        title: note.title,
        content: note.content,
        tags: note.tags,
      }); // PATCH /notes/<id>/

      setNotes((prev) =>
        prev.map((n) => (n.id === updated.id ? updated : n))
      ); // Replace updated note in state
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push("/login"); // Not authenticated
      } else if (err.response?.status === 400) {
        setError("Invalid tag selection"); // Backend rejected tag IDs
      } else {
        setError("Failed to edit note"); // Generic fallback error
      }
    }
  }

  // === Action: Delete a note === //
  async function removeNote(id: number) {
    try {
      await deleteNote(id); // DELETE /notes/<id>/
      setNotes((prev) => prev.filter((n) => n.id !== id)); // Remove deleted note from state
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push("/login"); // Not authenticated
      } else {
        setError("Failed to delete note"); // Generic fallback error
      }
    }
  }

  // === Return API === //
  return {
    notes,      // All notes
    error,      // Current error message
    loading,    // Is a note request running?
    createNote, // Create a new note
    saveEdit,   // Save edits to an existing note
    removeNote, // Delete a note
    setNotes,   // Manually update notes (optional)
    setError,   // Manually clear/set errors
  };
}
