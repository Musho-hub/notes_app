"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// -= HOOKS =- //
import { useNotes } from "@/hooks/useNotes";
import { useTags } from "@/hooks/useTags";

// -= API =- //
import { logout } from "@/lib/api";

// -= COMPONETS =- //
import { UserMenu } from "@/components/UserMenu";
import { TagSelector } from "@/components/TagSelector";
import { TagChip } from "@/components/TagChip";

// -= TYPES =- //
import type { Note } from "@/lib/types";

/**
 * NotesPage
 * --------------------------------
 * Displays a list of notes fetched from the backend and
 * allows the user to create, edit, and delete notes.
 * Uses the `useNotes` hook for all note logic.
 */
const NotesPage = () => {
  // Note fields for the "Create note" form
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  
  // Editing and existing note
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Tags selected for a new note
  const [newNoteTags, setNewNoteTags] = useState<number[]>([]);
  
  // == Hooks for notes & tags == //
  const { notes, error, loading, createNote, saveEdit, removeNote, setError } = useNotes();
  const { tags, createTag, deleteTag } = useTags();

  const router = useRouter();

  // === Logout handler === //
  const handleLogout = async () => {
    try {
      await logout(); // Clears HttpOnly cookies on backend
      router.push("/login");
    } catch {
      setError("Failed to logout");
    }
  };

  // === Create note handler === //
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createNote(title, content, newNoteTags);
      setTitle("");
      setContent("");
      setNewNoteTags([]);
    } catch {
      setError("Failed to create note");
    }
  };

  // === Edit note handler === //
  const handleSaveEdit = async () => {
    if (!editingNote) return;
    try {
      await saveEdit(editingNote);
      setEditingNote(null);
    } catch {
      setError("Failed to edit note");
    }
  };

  // === Delete note handler === //
  const handleDelete = async (id: number) => {
    try {
      await removeNote(id);
    } catch {
      setError("Failed to delete note");
    }
  };

  // Placeholder username for testing - swapping it later for JWT-based username
  const username = notes.length > 0 ? notes[0].owner_username : "User";

  return (
    <div className="p-8 min-h-screen bg-page text-text transition-colors duration-500">
      {/* === Header - Title + User Menu === */}
      <div className="flex justify-between items-center mb-6">
        {/* <h1 className="text-2xl font-bold underlines">My Notes</h1> */}
        {/* ^ My Notes ^ */}
        <h1 className="text-2xl font-bold underline capitalize">{username}'s Notes</h1>
        {/* ^ username + Notes ^ */}
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
        <TagSelector 
          tags={tags}
          selected={newNoteTags}
          onToggle={(tagId) => {
            setNewNoteTags((prev) => 
              prev?.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
            );
          }}
          onCreate={createTag}
          onDelete={deleteTag}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border rounded-lg cursor-pointer hover:bg-green-500/25 hover:border-green-500 transition duration-300 focus:outline-0 focus:border-green-500 focus:bg-green-500/25"
        >
          {loading ? "Adding..." : "Add note"}
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
                <TagSelector 
                  tags={tags}
                  selected={editingNote.tags}
                  onToggle={(tagId) => {
                    const updatedTags = editingNote.tags.includes(tagId)
                      ? editingNote.tags.filter((id) => id !== tagId)
                      : [...editingNote.tags, tagId];
                    setEditingNote({ ...editingNote, tags: updatedTags });
                  }}
                  onCreate={createTag}
                  onDelete={deleteTag}
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
                <div className="flex flex-wrap gap-2 mb-3">
                  {note.tags.map((tagId) => {
                    const tag = tags.find((t) => t.id === tagId);
                    return (
                      tag && (
                        <TagChip
                          key={tagId}
                          label={tag.name}
                          selected={false}
                        />
                      )
                    );
                  })}
                </div>
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
