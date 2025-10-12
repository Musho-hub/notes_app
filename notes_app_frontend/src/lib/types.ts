export interface Note {    // Notes
    id: number;
    title: string;
    content: string;
    created_at: string;
    owner: number;
    owner_username: string;
}

export interface TokenResponse {    // Auth (JWT)
    access: string;
    refresh: string;
}