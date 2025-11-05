"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// -= API =- //
import api, { fetchNotes, deleteNote, updateNote } from "@/lib/api";

// -= TYPES =- //
import type { Note } from "@/lib/types";

/**
 * Hook to manage note data and API interactions.
 * Handles fetching, creating, updating, and deleting notes
 * from the backend API, using HttpOnly JWT cookies for authentication.
 * This hook also manages local state for loading and error handling,
 * and automatically redirects to `/login` if authentication fails.
 */
export function useNotes() {
  // ---------------------------------------------------------------------------
  // Local state
  // ---------------------------------------------------------------------------
  const [notes, setNotes] = useState<Note[]>([]); // All notes fetched from the backend
  const [error, setError] = useState(""); // Error message
  const [loading, setLoading] = useState(false); // Whether an API request is in progress

  const router = useRouter();

  // === Load notes on mount === //
  useEffect(() => {
    /**
     * Fetch all notes when the component first mounts.
     * If authentication fails (401/403), redirect to `/login`.
     */
    async function loadNotes() {
      setLoading(true); // Show loading state while fetching
      try {
        const data = await fetchNotes(); // Fetch notes from the backend (JWT cookie is sent automatically)
        setNotes(data); // Save fetched notes into state → triggers re-render
      } catch (err: any) {
        // If authentication fails (expired or invalid token), redirect to login
        if (err.response?.status === 401 || err.response?.status === 403) {
          router.push("/login"); // If not authenticated → redirect to login
        } else {
          // Handle general fetch errors
          setError("Failed to load notes");
        }
      } finally {
        // Remove loading state regardless of success or failure
        setLoading(false);
      }
    }
    loadNotes(); // Run the async function once when the component mounts
  }, [router]);

  // === Create a new note === //
  async function createNote(title: string, content: string) {
    /**
     * Sends a POST request to create a new note in the backend.
     * Adds the new note to the local `notes` state.
     */
    try {
      // Send POST request to backend with note data
      const res = await api.post<Note>("notes/", { title, content });

      // Add new note to top of list
      setNotes((prev) => [res.data, ...prev]);
    } catch (err: any) {
      // Redirect to login if auth token is invalid or expired
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push("/login");
      } else {
        // Display error if request fails
        setError("Failed to create note");
      }
    }
  }

  // === Save edits to an existing note === //
  async function saveEdit(note: Note) {
    /**
     * Sends a PATCH request to update a note’s title and content.
     * Replaces the updated note in local state with the new version.
     */
    try {
      // Send PATCH request with updated title and content
      const updated = await updateNote(note.id, {
        title: note.title,
        content: note.content,
      });

      // Replace the old version of the note with the updated one in local state
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    } catch (err: any) {
      // Redirect to login if unauthorized
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push("/login");
      } else {
        // Display error if request fails
        setError("Failed to edit note");
      }
    }
  }

  // === Delete a note === //
  async function removeNote(id: number) {
    /**
     * Sends a DELETE request to remove a note from the backend.
     * Also removes the deleted note from local state.
     */
    try {
      // Send DELETE request to remove note from backend
      await deleteNote(id);

      // Filter out the deleted note from local state
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err: any) {
      // Redirect to login if unauthorized
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push("/login");
      } else {
        // Display error if request fails
        setError("Failed to delete note");
      }
    }
  }

  // === Expose state and functions === //
  return {
    notes, // Array of all current notes
    error, // Current error message (if any)
    loading, // Whether the app is waiting for an API response
    createNote, // Function to create a new note
    saveEdit, // Function to update a note
    removeNote, // Function to delete a note
    setNotes, // Setter (useful for manual updates or optimistic UI)
    setError, // Setter for error messages
  };
}
