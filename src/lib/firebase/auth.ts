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

export interface SignInResult {
  user: AuthUser;
  accessToken: string | null;
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
googleProvider.addScope("https://www.googleapis.com/auth/gmail.readonly");

export async function signInWithGoogle(): Promise<SignInResult> {
  const result = await signInWithPopup(getAuthInstance(), googleProvider);
  const credential = GoogleAuthProvider.credentialFromResult(result);

  return {
    user: mapUser(result.user),
    accessToken: credential?.accessToken ?? null,
  };
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
