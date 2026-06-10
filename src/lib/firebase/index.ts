export { firebaseConfig, isFirebaseConfigured, getFirebaseApp } from "./config";
export { signInWithGoogle, signOut, subscribeToAuthState } from "./auth";
export type { AuthUser, SignInResult } from "./auth";
export {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  updateLeadStatus,
  deleteLead,
} from "./firestore";
