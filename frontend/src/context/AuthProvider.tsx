import { useCallback, useEffect, useMemo, useState } from "react";
import { request, setOnUnauthorizedCallback } from "../api/client";
import type { LoginSuccess, SessionUser } from "../types/api";
import { AuthContext } from "./AuthContext";
import type { AuthContextValue } from "./AuthContext";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Clear auth state on any 401 so ProtectedRoute redirects to login
    // (handles mid-session cookie expiry). Safe for login/me 401s since
    // isAuthenticated is already false in those cases.
    setOnUnauthorizedCallback(() => setIsAuthenticated(false));

    request<SessionUser>("/auth/me")
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setInitialized(true));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setError(null);
    try {
      await request<LoginSuccess>("/auth/login", {
        method: "POST",
        body: { username, password },
      });
      setIsAuthenticated(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Login failed";
      setError(message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    try {
      await request("/auth/logout", { method: "POST" });
    } finally {
      setIsAuthenticated(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      error,
      login,
      logout,
    }),
    [isAuthenticated, error, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {initialized ? children : null}
    </AuthContext.Provider>
  );
}
