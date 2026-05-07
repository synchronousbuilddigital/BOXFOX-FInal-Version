"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastContext";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { showToast } = useToast();

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const res = await fetch("/api/auth/me", { cache: "no-store" });
            if (!res.ok) {
                setUser(null);
                return;
            }
            const data = await res.json();
            if (data.user) {
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (res.ok) {
            setUser(data.user);
            showToast(`Welcome back, ${data.user.name}!`);
            return { success: true, user: data.user };
        }
        showToast(data.error || "Login failed", "error");
        return { success: false, error: data.error };
    };

    const signup = async (userData) => {
        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });

        const data = await res.json();
        if (res.ok) {
            return { success: true };
        }
        return { success: false, error: data.error };
    };

    const logout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        setUser(null);
        showToast("Logged out successfully", "info");
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, checkUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
