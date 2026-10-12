"use client";

import { createContext, useContext } from "react";
import { useAuthState } from "@/features/frontend/auth/hooks/useAuthState";

type AuthContextValue = ReturnType<typeof useAuthState>;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthState();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext phải được dùng bên trong AuthProvider");
  }
  return context;
}
