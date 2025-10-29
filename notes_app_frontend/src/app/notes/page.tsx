"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// === API === //
import api, { deleteNote, fetchNotes, updateNote } from "@/lib/api";

// === COMPONETS === //
import { UserMenu } from "@/components/UserMenu";

// === TYPES === //
import type { Note } from "@/lib/types";


const NotesPage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const router = useRouter();

  useEffect(() => {
    // ^ This effect runs when the component mounts (or when router changes).
    // It tries to load the user's notes from the backend API.
    async function loadNotes() {
      try {
        // Grab the access token from localStorage
        const token = localStorage.getItem("access_token");
        if (!token) {
          // If no token exists → user isn’t logged in
          setError("No token found. Please log in first");
          router.push("/login"); // Redirect to login
          return; // Stop execution
        }
        // Fetch notes from backend API using the token for authentication
        const data = await fetchNotes(token);
        // Save the notes into React state → triggers re-render
        setNotes(data);
      } catch (err: any) {
        // Check if it’s an authentication error (token expired/invalid)
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("access_token"); // Clear expired/invalid token
          router.push("/login"); // Redirect to login
        } else {
          setError("Failed to load notes");
        }
      }
    }
    loadNotes();
  }, [router]);

  const handleLogout = () => {
    // ^ Called when the user clicks the "Logout" button

    // Remove the stored JWT access token so the user is no longer authenticated
    localStorage.removeItem("access_token"); // Short-lived token for API requests
    localStorage.removeItem("refresh_token"); // Longer-lived token used to get new access tokens
    router.push("/login"); // Redirect to login
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    // ^ Called when the user submits the "Create Note" form
    // e = form submit event
    e.preventDefault(); // Prevents the default browser behavior (page reload on form submit)
    try {
      // Get the access token from localStorage
      const token = localStorage.getItem("access_token");
      if (!token) {
        // If no token exists → user isn’t logged in
        setError("No token found. Please log in first.");
        return; // Stop execution
      }

      // Send POST request to backend API to create a new note
      const res = await api.post<Note>(
        "notes/", // Endpoint: /api/notes/
        { title, content }, // Payload: note data from form inputs
        { headers: { Authorization: `Bearer ${token}` } } // Auth header with token
      );

      // Update state with the newly created note
      // - res.data = the note returned from the backend (with id, owner, timestamps)
      // - Prepend it to the existing notes list (new note at the top)
      setNotes([res.data, ...notes]); // Add new note to the top

      // Clear form inputs after successful submission
      setTitle("");
      setContent("");
    } catch (err: any) {
      setError("Failed to create note");
    }
  };

  const handleDelete = async (id: number) => {
    // ^ Called when the user clicks "Delete" on a note

    // If no token exists, user isn’t logged in → stop
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      // Send DELETE request to backend to remove the note
      await deleteNote(id, token);

      // Update local state:
      // Filter out the deleted note so it disappears from UI
      setNotes(notes.filter((n) => n.id !== id));
    } catch (err: any) {
      setError("Failed to delete note");
    }
  };

  const handleSaveEdit = async () => {
    // ^ Called when the user clicks "Save" while editing a note
    if (!editingNote) return; // If no note is currently being edited, do nothing

    // If no token exists, user isn’t logged in → stop
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      // Send PATCH request to backend to update the note
      const updated = await updateNote(
        editingNote.id, // Note ID to update
        { title: editingNote.title, content: editingNote.content }, // New data
        token // Auth token
      );

      // Update local state:
      // Replace the old note in the notes array with the updated one
      setNotes(notes.map((n) => (n.id === updated.id ? updated : n)));

      // Exit edit mode (clear editingNote)
      setEditingNote(null);
    } catch (err: any) {
      setError("Failed to edit note");
    }
  };

  // Placeholder username for testing - swapping it later for JWT-based username
  const username = notes.length > 0 ? notes[0].owner_username : "User";

  return (
    <div className={`p-8 min-h-screen bg-page text-text transition-colors duration-500`}>
      {/* === Header - Title + User Menu === */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold underline">My Notes</h1>
        <UserMenu username={username} onLogout={handleLogout} />
      </div>

      {/* === Create note form === */}
      <form onSubmit={handleCreateNote} className="mb-6 space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          className="w-full p-2 border rounded-lg hover:bg-blue-500/10 hover:border-blue-500 transition duration-300 focus:outline-0 focus:border focus:border-blue-500 focus:bg-blue-500/10"
          required
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Note content"
          className="w-full p-2 border rounded-lg resize-none hover:bg-blue-500/10 hover:border-blue-500 transition duration-300 focus:outline-0 focus:border focus:border-blue-500 focus:bg-blue-500/10"
          rows={4}
          required
        />
        <button
          type="submit"
          className="px-4 py-2 border rounded-lg cursor-pointer hover:bg-green-500/25 hover:border-green-500 transition duration-300 focus:outline-0 focus:border-green-500 focus:bg-green-500/25"
        >
          Add note
        </button>
      </form>

      {error && <p className="text-red-600">{error}</p>}

      {/* Mapped out notes - if user clicks "Edit" render edit of specific note */}
      <ul className="space-y-4">
        {notes.map((note) => (
          <li
            key={note.id}
            className={`p-4 border rounded-lg shadow-sm transition-colors duration-500`}
          >
            {editingNote?.id === note.id ? (
              <>
                <input
                  type="text"
                  value={editingNote.title}
                  onChange={(e) =>
                    setEditingNote({ ...editingNote, title: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg mb-2 hover:bg-yellow-500/10 hover:border-yellow-500 transition duration-300 focus:outline-0 focus:border focus:border-yellow-500 focus:bg-yellow-500/10"
                />
                <textarea
                  value={editingNote.content}
                  onChange={(e) =>
                    setEditingNote({ ...editingNote, content: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg mb-2 resize-none hover:bg-yellow-500/10 hover:border-yellow-500 transition duration-300 focus:outline-0 focus:border focus:border-yellow-500 focus:bg-yellow-500/10"
                  rows={3}
                />
                <div className="flex justify-between">
                  <button
                    onClick={handleSaveEdit}
                    className="border px-3 py-1 rounded-lg mr-2 cursor-pointer hover:bg-green-500/25 hover:border-green-500 transition duration-300 focus:outline-0 focus:border-green-500 focus:bg-green-500/25"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingNote(null)}
                    className="border px-3 py-1 rounded-lg cursor-pointer hover:bg-red-500/25 hover:border-red-500 transition duration-300 focus:outline-0 focus:border-red-500 focus:bg-red-500/25"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="md:flex justify-between items-center">
                  <h3 className="font-semibold">{note.title}</h3>
                  <small className="text-gray-500">
                    by {note.owner_username} on{" "}
                    {new Date(note.created_at).toLocaleString()}
                  </small>
                </div>
                <p className="text-gray-700 py-5">{note.content}</p>
                <div className="mt-2 flex justify-between">
                  <button
                    onClick={() => setEditingNote(note)}
                    className="border px-3 py-1 rounded-lg mr-2 cursor-pointer hover:bg-yellow-500/25 hover:border-yellow-500 transition duration-300 focus:outline-0 focus:border-yellow-500 focus:bg-yellow-500/25"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="border px-3 py-1 rounded-lg cursor-pointer hover:bg-red-500/25 hover:border-red-500 transition duration-300 focus:outline-0 focus:border-red-500 focus:bg-red-500/25"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotesPage;
