"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// === API === //
import api, { fetchNotes, deleteNote, updateNote } from "@/lib/api";

// === TYPES === //
import type { Note } from "@/lib/types";

/**
 * Hook to manage note data and API interactions.
 * Handles loading, creation, editing, and deletion of notes.
 */
export function useNotes() {
    // === Local State === //
    const [notes, setNotes] = useState<Note[]>([]); // All notes fetched from the backend
    const [error, setError] = useState("");         // Error message (if any)
    const [loading, setLoading] = useState(false);  // Loading indicator for API actions
    const router = useRouter();

    // === Load Notes on Mount === //
    useEffect(() => {
        /**
        * Fetches all notes from the backend API on initial render.
        * If no token exists, redirects the user to the login page.
        */
        async function loadNotes() {
            const token = localStorage.getItem("access_token"); // Grab the access token from localStorage
            if (!token) {
                // No token → user is not authenticated → redirect to login
                router.push("/login");
                return; // Stop execution
            }
            setLoading(true); // Show loading state while fetching
            try {
                // Fetch all notes from backend API
                const data = await fetchNotes(token);
                // Save fetched notes into state → triggers re-render
                setNotes(data);
            } catch (err: any) {
                // Handle authentication errors (expired or invalid token)
                if (err.response?.status === 401 || err.response?.status === 403) {
                    localStorage.removeItem("access_token"); // Clear expired/invalid token
                    router.push("/login");  // Redirect user to login page
                } else {
                    // Handle general fetch errors
                    setError("Failed to load notes");
                }
            } finally {
                // Always remove loading state, even if error occurs
                setLoading(false);
            }
        }
        loadNotes();    // Run the async function once when the component mounts
    }, [router]);

    // === Create a new note === //
    async function createNote(title: string, content: string) {
        /**
        * Sends a POST request to create a new note in the backend.
        * Adds the new note to the local `notes` state.
        */
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("Not authenticated");
        // Send POST request with new note data
        const res = await api.post<Note>(
            "Notes/", // Endpoint: /api/notes/
            { title, content }, // Payload: note data from form inputs
            { headers: { Authorization: `Bearer ${token}`} } // Auth header with token
        );
        // Update state with the newly created note
        // - res.data = the note returned from the backend (with id, owner, timestamps)
        // - Prepend it to the existing notes list (new note at the top)
        setNotes((prev) => [res.data, ...prev]);
    }

    // === Save edits to an existing note === //
    async function saveEdit(note: Note) {
        /**
        * Sends a PATCH request to update a note’s title and content.
        * Replaces the updated note in local state with the new version.
        */
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("Not authenticated");
        // Send PATCH request to update note
        const updated = await updateNote(
            note.id, // Note ID to update
            { title: note.title, content: note.content }, // New data
            token // Auth token
        );
        // Update local state: replace old note with updated version
        setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    }

    // === Delete a note === //
    async function removeNote(id: number) {
        /**
        * Sends a DELETE request to remove a note from the backend.
        * Also removes the deleted note from local state.
        */
        const token = localStorage.getItem("access_token");
        if (!token) return;

        await deleteNote(id, token); // Delete note from backend

        // Remove deleted note from local state
        setNotes((prev) => prev.filter((n) => n.id !== id));
    }

    // === Expose state and functions === //
    return {
        notes,          // Array of all current notes
        error,          // Current error message (if any)
        loading,        // Whether the app is waiting for an API response
        createNote,     // Function to create a new note
        saveEdit,       // Function to update a note
        removeNote,     // Function to delete a note
        setNotes,       // Setter (useful for manual updates or optimistic UI)
        setError,       // Setter for error messages
    };
}