"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasTokenInCookies } from "../services/user-access";

export const useAuthCheck = () => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const tokenExists = hasTokenInCookies();
        
        if (!tokenExists) {
            router.replace("/auth");
            return;
        }

        setIsAuthenticated(true);
        setLoading(false);
    }, []);

    return { isAuthenticated, loading };
};