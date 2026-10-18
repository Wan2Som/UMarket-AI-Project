"use client";

import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { auth, googleProvider, isFirebaseConfigured } from "./firebase";
import { getUserProfile, saveUserProfile } from "./firestore";
import type { UserProfile } from "./types";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  /** Signed in but no Telegram handle yet: buyers would have no way to reach them. */
  needsTelegram: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  saveTelegram: (handle: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
        return;
      }
      try {
        const existing = await getUserProfile(u.uid);
        const next: UserProfile = existing ?? {
          uid: u.uid,
          displayName: u.displayName ?? "Student",
          photoURL: u.photoURL ?? null,
          telegram: null,
        };
        // Keep name and photo in step with the Google account.
        next.displayName = u.displayName ?? next.displayName;
        next.photoURL = u.photoURL ?? next.photoURL;
        if (!existing) await saveUserProfile(next);
        setProfile(next);
      } catch (err) {
        console.error("Couldn't load profile", err);
        setProfile({ uid: u.uid, displayName: u.displayName ?? "Student", photoURL: u.photoURL, telegram: null });
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const signIn = useCallback(async () => {
    if (!auth) throw new Error("Sign-in needs Firebase keys in .env.local.");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const code = (err as { code?: string }).code;
      // Some in-app browsers (e.g. Telegram's) block popups; fall back to a full redirect.
      if (code === "auth/popup-blocked" || code === "auth/operation-not-supported-in-this-environment") {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return;
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    if (auth) await fbSignOut(auth);
  }, []);

  const saveTelegram = useCallback(
    async (handle: string) => {
      if (!profile) throw new Error("Sign in first.");
      const next = { ...profile, telegram: handle };
      await saveUserProfile(next);
      setProfile(next);
    },
    [profile],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      needsTelegram: !!user && !!profile && !profile.telegram,
      signIn,
      signOut,
      saveTelegram,
    }),
    [user, profile, loading, signIn, signOut, saveTelegram],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
