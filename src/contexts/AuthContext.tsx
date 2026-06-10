"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  signInWithGoogle,
  signOut,
  subscribeToAuthState,
  type AuthUser,
} from "@/lib/firebase";

const GMAIL_TOKEN_KEY = "gmail_access_token";

interface AuthContextValue {
  user: AuthUser | null;
  gmailAccessToken: string | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [gmailAccessToken, setGmailAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = sessionStorage.getItem(GMAIL_TOKEN_KEY);
    if (storedToken) {
      setGmailAccessToken(storedToken);
    }
  }, []);

  useEffect(() => {
    try {
      const unsubscribe = subscribeToAuthState((authUser) => {
        setUser(authUser);
        setLoading(false);
      });
      return unsubscribe;
    } catch {
      setLoading(false);
      return undefined;
    }
  }, []);

  const handleSignIn = async () => {
    const { user: signedInUser, accessToken } = await signInWithGoogle();
    setUser(signedInUser);

    if (accessToken) {
      setGmailAccessToken(accessToken);
      sessionStorage.setItem(GMAIL_TOKEN_KEY, accessToken);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setGmailAccessToken(null);
    sessionStorage.removeItem(GMAIL_TOKEN_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        gmailAccessToken,
        loading,
        signInWithGoogle: handleSignIn,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
