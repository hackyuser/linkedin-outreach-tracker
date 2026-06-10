import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { getFirebaseApp } from "./config";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

function mapUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
}

function getAuthInstance() {
  return getAuth(getFirebaseApp());
}

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<AuthUser> {
  const result = await signInWithPopup(getAuthInstance(), googleProvider);
  return mapUser(result.user);
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(getAuthInstance());
}

export function subscribeToAuthState(
  callback: (user: AuthUser | null) => void
): () => void {
  return onAuthStateChanged(getAuthInstance(), (user) => {
    callback(user ? mapUser(user) : null);
  });
}
