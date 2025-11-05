import axios from "axios";
import type { Note } from "./types";

const api = axios.create({
    baseURL: "http://localhost:8000/api/", // Django backend base URL
    withCredentials: true, // Include cookies (access/refresh) with each request
});

// === AUTH ENDPOINTS === //

// Login - cookies are set automatically by the backend
export async function login(username: string, password: string,) {
    await api.post("token/", { username, password });
}

// Logout - clears cookies
export async function logout() {
    await api.post("auth/logout/");
}

// === NOTES ENDPOINTS === //

// Fetch notes - Django reads the access token from cookies
export async function fetchNotes() {
    const res = await api.get<Note[]>("notes/");
    return res.data;
}

// Update note
export async function updateNote(id: number, data: Partial<Note>) {
    const res = await api.patch<Note>(`notes/${id}/`, data);
    return res.data;
}

// Delete a note
export async function deleteNote(id: number) {
    await api.delete(`notes/${id}/`);
}

export default api;