"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

// -= API =- //
import api from "@/lib/api"

const RegisterPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        try {
            await api.post("auth/register/", { username, password });
            router.push("/notes"); // Automatically logged in via cookies
        } catch {
            setError("Registration failed. Try another username.");
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <form onSubmit={handleRegister} className="shadow-xl rounded-2xl p-8 w-96">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold text-gray-700 underline">My Notes</h1>
                    <h2 className="text-xl font-bold text-gray-700">Sign up</h2>
                </div>
                {error && <p className="text-red-500 mb-2">{error}</p>}
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border rounded-lg p-2 mb-3 hover:bg-blue-500/10 hover:border-blue-500 transition duration-300 ease-in-out focus:outline-0 focus:border-blue-500 focus:bg-blue-500/10" />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-lg p-2 mb-3 hover:bg-blue-500/10 hover:border-blue-500 transition duration-300 ease-in-out focus:outline-0 focus:border-blue-500 focus:bg-blue-500/10" />
                <button type="submit" className="w-full border p-2 rounded-lg cursor-pointer hover:bg-green-500/25 hover:border-green-500 transition duration-300 ease-in-out focus:outline-0 focus:border-green-500 focus:bg-green-500/25">Sign up</button>
                <p className="text-sm text-center mt-4">
                    Already have an account?{" "}
                    <a href="/login" className="text-blue-500 hover:underline">Log in</a>
                </p>
            </form>
        </div>
    );

}

export default RegisterPage