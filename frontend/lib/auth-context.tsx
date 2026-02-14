"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { User } from "@/types/marketplace";

// ----------------------------------------------------------------
// Auth context — calls /api/auth/* BFF routes which proxy to the
// Python backend's real accounts table.
// ----------------------------------------------------------------

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<string | null>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<string | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const STORAGE_KEY = "gatorslist_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored) as User);
    } catch {
      /* ignore corrupt storage */
    }
    setLoading(false);
  }, []);

  const persist = useCallback((u: User | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  /** Returns null on success, or an error message string on failure. */
  const login = useCallback(
    async (username: string, password: string): Promise<string | null> => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          return err?.detail ?? "Invalid username or password.";
        }
        const data = (await res.json()) as { user: User };
        persist(data.user);
        return null;
      } catch {
        return "Network error. Please try again.";
      }
    },
    [persist],
  );

  /** Returns null on success, or an error message string on failure. */
  const register = useCallback(
    async (
      username: string,
      email: string,
      password: string,
    ): Promise<string | null> => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          return err?.detail ?? "Registration failed. Please try again.";
        }
        const data = (await res.json()) as { user: User };
        persist(data.user);
        return null;
      } catch {
        return "Network error. Please try again.";
      }
    },
    [persist],
  );

  const logout = useCallback(() => {
    persist(null);
  }, [persist]);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
