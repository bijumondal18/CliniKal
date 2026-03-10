"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  getFirebaseAuth,
} from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";

type User = { uid: string; email: string | null; displayName?: string };

type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

function firebaseUserToUser(fb: FirebaseUser): User {
  return {
    uid: fb.uid,
    email: fb.email ?? null,
    displayName: fb.displayName ?? undefined,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setIsLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser ? firebaseUserToUser(fbUser) : null);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      const auth = getFirebaseAuth();
      if (!auth) {
        return { success: false, error: "Firebase is not configured. Add your Firebase config to .env.local." };
      }
      try {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        return { success: true };
      } catch (err: unknown) {
        const message = err && typeof err === "object" && "code" in err
          ? (err as { code: string }).code === "auth/invalid-credential" || (err as { code: string }).code === "auth/user-not-found"
            ? "Invalid email or password."
            : (err as { message?: string }).message ?? "Login failed."
          : "Login failed.";
        return { success: false, error: message };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (auth) {
      await firebaseSignOut(auth);
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
