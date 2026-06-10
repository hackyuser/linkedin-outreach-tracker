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

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

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
    await signInWithGoogle();
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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
