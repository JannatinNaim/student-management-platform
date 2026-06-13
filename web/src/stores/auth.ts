"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/types";

interface AuthState {
  accessToken: string | null;
  user: User | null;
  hydrated: boolean;
  setSession: (accessToken: string, user: User) => void;
  setUser: (user: User) => void;
  clearSession: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      hydrated: false,
      setSession: (accessToken, user) => set({ accessToken, user }),
      setUser: (user) => set({ user }),
      clearSession: () => set({ accessToken: null, user: null }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "sn-auth",
      partialize: (state) => ({ accessToken: state.accessToken, user: state.user }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    }
  )
);
