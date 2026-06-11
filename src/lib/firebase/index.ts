export { firebaseConfig, isFirebaseConfigured, getFirebaseApp } from "./config";
export { signInWithGoogle, signOut, subscribeToAuthState } from "./auth";
export type { AuthUser, SignInResult } from "./auth";
export {
  getLeads,
  getLeadById,
  createLead,
  createLeadsBulk,
  updateLead,
  updateLeadStatus,
  deleteLead,
} from "./firestore";
export {
  getProcessedGmailMessageIds,
  isGmailMessageProcessed,
  markGmailMessageProcessed,
  processedMessageDocId,
} from "./processedMessages";
