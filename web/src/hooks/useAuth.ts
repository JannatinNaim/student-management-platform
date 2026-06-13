"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";
import { useAuthStore } from "@/stores/auth";

interface Session {
  accessToken: string;
  user: User;
}

export function useAuth() {
  const { user, accessToken, hydrated, setSession, clearSession, setUser } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const applySession = useCallback(
    (session: Session) => setSession(session.accessToken, session.user),
    [setSession]
  );

  const login = useCallback(
    async (identifier: string, password: string) => {
      const { data } = await api.post("/auth/login", { identifier, password });
      applySession(data.data);
      return data.data.user as User;
    },
    [applySession]
  );

  const register = useCallback(
    async (payload: {
      name: string;
      username: string;
      email: string;
      password: string;
      locale?: "en" | "bn";
    }) => {
      const { data } = await api.post("/auth/register", payload);
      applySession(data.data);
      return data.data.user as User;
    },
    [applySession]
  );

  const loginWithGoogle = useCallback(
    async (idToken: string) => {
      const { data } = await api.post("/auth/google", { idToken });
      applySession(data.data);
      return data.data.user as User;
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    await api.post("/auth/logout").catch(() => undefined);
    clearSession();
    queryClient.clear();
    router.push("/");
  }, [clearSession, queryClient, router]);

  const refreshUser = useCallback(async () => {
    const { data } = await api.get("/auth/me");
    setUser(data.data);
  }, [setUser]);

  return {
    user,
    isAuthenticated: !!accessToken,
    isAdmin: user?.role === "ADMIN",
    hydrated,
    login,
    register,
    loginWithGoogle,
    logout,
    refreshUser,
  };
}
