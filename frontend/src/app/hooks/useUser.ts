import { useState, useEffect } from "react";
import { api, getAuthToken, clearAuthToken, type UserProfile } from "../lib/api";

export interface UserState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  isLoggedIn: boolean;
  /** Google profile picture URL extracted from JWT or localStorage */
  avatarUrl: string | null;
  logout: () => void;
}

const AVATAR_KEY = "saya.userAvatar";
const USER_CACHE_KEY = "saya.userProfile";

export function useUser(): UserState {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const cached = localStorage.getItem(USER_CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = getAuthToken();
  const isLoggedIn = !!token;

  // Try to extract avatar from JWT payload or localStorage
  const avatarUrl = (() => {
    const stored = localStorage.getItem(AVATAR_KEY);
    if (stored) return stored;

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.picture) {
          localStorage.setItem(AVATAR_KEY, payload.picture);
          return payload.picture;
        }
      } catch {
        // JWT parsing failed, no avatar
      }
    }
    return null;
  })();

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    api
      .profile()
      .then((profile) => {
        if (cancelled) return;
        setUser(profile);
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(profile));
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const logout = () => {
    clearAuthToken();
    localStorage.removeItem(AVATAR_KEY);
    localStorage.removeItem(USER_CACHE_KEY);
    setUser(null);
    window.location.href = "/";
  };

  return { user, loading, error, isLoggedIn, avatarUrl, logout };
}
