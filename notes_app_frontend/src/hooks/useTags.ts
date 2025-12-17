"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// -= API =- //
import { 
    fetchTags,
    createTag as createTagAPI,
    deleteTag as deleteTagAPI,
} from "@/lib/api";

// -= TYPES =- //
import type { Tag } from "@/lib/types";

/**
 * useTags()
 * ---------------------------------------------------------
 * Manages user tags:
 * - Fetch all tags on mount
 * - Create a new tag
 * - Delete an existing tag
 *
 * Uses HttpOnly JWT cookies (auth handled by backend).
 * Redirects to `/login` on 401/403 responses.
 */
export function useTags() {
    // === State === //
    const [tags, setTags] = useState<Tag[]>([]); // All tags belonging to the user
    const [loading, setLoading] = useState(false); // Loading indicator for tag requests
    const [error, setError] = useState(""); // Error message (empty string = none)

    const router = useRouter(); // Next router for auth redirects

    // === Effect: Load tags on mount === //
    useEffect(() => {
        async function loadTags() {
            setLoading(true); // Start loading state

            try {
                const data = await fetchTags(); // GET /tags/
                setTags(data); // Store tags in state
            } catch (err: any) {
                // If auth is missing/expired → redirect to login
                if (err.response?.status === 401 || err.response?.status === 403) {
                    router.push("/login");
                } else {
                    setError("Failed to load tags"); // Generic fallback error
                }
            } finally {
                setLoading(false); // Stop loading (success or error)
            }
        }

        loadTags();     // Run once on mount
    }, [router]);

    // === Action: Create a new tag === //
    async function createTag(name: string) {
        try {
            const newTag = await createTagAPI(name); // POST /tags/
            setTags((prev) => [...prev, newTag]); // Append new tag to list
        } catch (err: any) {
            if (err.response?.status === 400) {
                setError("Tag already exists"); // Backend rejected duplicate tag
            } else if (err.response?.status === 401 || err.response?.status === 403) {
                router.push("/login"); // Not authenticated
            } else {
                setError("Failed to create tag"); // Generic fallback error
            }
        }
    }

    // === Action: Delete a tag === //
    async function deleteTag(id: number) {
        try {
            await deleteTagAPI(id); // DELETE /tags/<id>/
            setTags((prev) => prev.filter((t) => t.id !== id)); // Remove tag from state
        } catch (err: any) {
            if (err.response?.status === 401 || err.response?.status === 403) {
                router.push("/login"); // Not authenticated
            } else {
                setError("Failed to delete tag"); // Generic fallback error
            }
        }
    }

    // === Return API === //
    return {
        tags,       // All tags
        loading,    // Is a tag request running?
        error,      // Current error message
        createTag,  // Create a new tag
        deleteTag,  // Delete an existing tag
        setError,   // Manually clear/set error state
        setTags,    // Manually override tags (optional)
    };
}