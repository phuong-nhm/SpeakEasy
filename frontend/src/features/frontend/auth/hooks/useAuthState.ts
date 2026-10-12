// src/features/frontend/auth/hooks/useAuthState.ts
"use client";

import { useCallback, useEffect, useState } from "react";

import { decodeJwtRoles, getToken } from "@/lib/apiClient";
import { User } from "@/features/frontend/auth/types/auth";
import { authService } from "@/features/frontend/auth/services/authService";

const AUTH_STATE_CHANGED_EVENT = "auth-state-changed";

export function useAuthState() {
  const [authState, setAuthState] = useState<{
    currentUser: User | null;
    accessToken: string | null;
    roles: string[];
    isInitialized: boolean;
  }>({
    currentUser: null,
    accessToken: null,
    roles: [],
    isInitialized: false,
  });

  const notifyAuthChanged = useCallback(() => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new Event(AUTH_STATE_CHANGED_EVENT));
  }, []);

  const persistAuthSession = useCallback((user: User) => {
    const token = getToken();
    setAuthState({
      currentUser: user,
      accessToken: token,
      roles: token ? decodeJwtRoles(token) : [],
      isInitialized: true,
    });
  }, []);

  const syncAuthState = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setAuthState({
        currentUser: null,
        accessToken: null,
        roles: [],
        isInitialized: true,
      });
      return;
    }

    try {
      const user = await authService.getCurrentUser();
      setAuthState({
        currentUser: user,
        accessToken: token,
        roles: decodeJwtRoles(token),
        isInitialized: true,
      });
    } catch {
      setAuthState({
        currentUser: null,
        accessToken: getToken(),
        roles: [],
        isInitialized: true,
      });
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      if (!isMounted) return;
      await syncAuthState();
    };

    const handleAuthStateChanged = () => {
      void initializeAuth();
    };

    void initializeAuth();

    if (typeof window !== "undefined") {
      window.addEventListener(AUTH_STATE_CHANGED_EVENT, handleAuthStateChanged);
    }

    return () => {
      isMounted = false;
      if (typeof window !== "undefined") {
        window.removeEventListener(
          AUTH_STATE_CHANGED_EVENT,
          handleAuthStateChanged,
        );
      }
    };
  }, [syncAuthState]);

  const logout = useCallback(() => {
    authService.logout();
    setAuthState({
      currentUser: null,
      accessToken: null,
      roles: [],
      isInitialized: true,
    });
    notifyAuthChanged();
  }, [notifyAuthChanged]);

  return {
    currentUser: authState.currentUser,
    accessToken: authState.accessToken,
    roles: authState.roles,
    isInitialized: authState.isInitialized,
    isAuthenticated: Boolean(authState.currentUser && authState.accessToken),
    isAdmin: authState.roles.includes("admin"),
    isManager: authState.roles.includes("Manager"),
    persistAuthSession,
    notifyAuthChanged,
    logout,
  };
}
