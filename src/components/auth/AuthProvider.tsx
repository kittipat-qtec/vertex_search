"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { AuthUser } from "@/lib/types";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: ReactNode;
  initialUser?: AuthUser | null;
}) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/whoami", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        let errMsg = "ไม่สามารถโหลดข้อมูลผู้ใช้ได้";
        try {
          const errPayload = (await response.json()) as { error?: string };
          errMsg = errPayload.error || errMsg;
        } catch { /* ignore parse error */ }
        throw new Error(errMsg);
      }

      const payload = (await response.json()) as {
        ok: boolean;
        user?: AuthUser;
        error?: string;
      };

      if (!payload.ok || !payload.user) {
        throw new Error(payload.error || "ไม่พบข้อมูลผู้ใช้");
      }

      setUser(payload.user);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "ไม่สามารถโหลดข้อมูลผู้ใช้ได้";

      setUser(null);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setUser(initialUser);
    setIsLoading(false);
    setError(null);
  }, [initialUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      error,
      refresh,
    }),
    [error, isLoading, refresh, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
