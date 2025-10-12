import axios from "axios";
import type { TokenResponse, Note } from "./types";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api/", // Django backend
});

// Login
export async function login(username: string, password: string,) {
    const res = await api.post<TokenResponse>("token/", { username, password });
    return res.data;
}

// Fetch notes
export async function fetchNotes(token: string) {
    const res = await api.get<Note[]>("notes/", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
}

// Update a note
export async function updateNote(id: number, data: Partial<Note>, token: string) {
    const res = await api.patch<Note>(
        `notes/${id}/`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
}

// Delete a note
export async function deleteNote(id: number, token: string) {
    await api.delete(`notes/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
    });
}

export default api;