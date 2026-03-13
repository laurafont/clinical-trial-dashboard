import { useCallback, useEffect, useMemo, useState } from "react";
import { request } from "../api/client";
import type { TokenResponse } from "../types/api";
import { AuthContext } from "./AuthContext";
import type { AuthContextValue } from "./AuthContext";

const TOKEN_KEY = "token";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  const login = useCallback(async (username: string, password: string) => {
    setError(null);
    try {
      const data = await request<TokenResponse>("/auth/login", {
        method: "POST",
        body: { username, password },
      });
      setToken(data.access_token);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Login failed";
      setError(message);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setError(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      isAuthenticated: token !== null,
      error,
      login,
      logout,
    }),
    [token, error, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
