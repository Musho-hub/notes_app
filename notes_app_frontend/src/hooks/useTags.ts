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
 * Hook for managing tags:
 * - Fetching all tags
 * - Creating new tags
 * - Deleting tags
 *
 * Tags are user-specific and require authentication (JWT HttpOnly cookies).
 */
export function useTags() {
    const [tags, setTags] = useState<Tag[]>([]); // All tags belonging to the user
    const [loading, setLoading] = useState(false); // API loading indicator
    const [error, setError] = useState(""); // Error message
    const router = useRouter();

    // ------------------------------------------
    // Load all tags when component mounts
    // ------------------------------------------
    useEffect(() => {
        async function loadTags() {
            setLoading(true);

            try {
                const data = await fetchTags(); // GET /tags/
                setTags(data);
            } catch (err: any) {
                if (err.response?.status === 401 || err.response?.status === 403) {
                    router.push("/login");
                } else {
                    setError("Failed to load tags");
                }
            } finally {
                setLoading(false);
            }
        }

        loadTags();
    }, [router]);

    // ------------------------------------------
    // Create a new tag
    // ------------------------------------------
    async function createTag(name: string) {
        try {
            const newTag = await createTagAPI(name); // POST /tags/

            // Append new tag to list
            setTags((prev) => [...prev, newTag]);
        } catch (err: any) {
            if (err.response?.status === 400) {
                setError("Tag already exists");
            } else if (err.response?.status === 401 || err.response?.status === 403) {
                router.push("/login");
            } else {
                setError("Failed to create tag");
            }
        }
    }

    // ------------------------------------------
    // Delete a tag
    // ------------------------------------------
    async function deleteTag(id: number) {
        try {
            await deleteTagAPI(id); // DELETE /tags/<id>/

            // Remove deleted tag from UI
            setTags((prev) => prev.filter((t) => t.id !== id));
        } catch (err: any) {
            if (err.response?.status === 401 || err.response?.status === 403) {
                router.push("/login");
            } else {
                setError("Failed to delete tag");
            }
        }
    }

    return {
        tags,
        loading,
        error,
        createTag,
        deleteTag,
        setError,
        setTags,
    };
}