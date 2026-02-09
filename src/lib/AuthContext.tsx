"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
    isAuthenticated: boolean;
    login: (email: string, password: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    useEffect(() => {
        const authStatus = localStorage.getItem("somo_auth_status");
        if (authStatus === "true") {
            setIsAuthenticated(true);
        }
        setIsInitialized(true);
    }, []);

    const login = (email: string, password: string) => {
        if (email === "admin@somoafrica.org" && password === "Abc123***") {
            setIsAuthenticated(true);
            localStorage.setItem("somo_auth_status", "true");
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem("somo_auth_status");
    };

    if (!isInitialized) {
        return null; // Or a loading spinner
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
