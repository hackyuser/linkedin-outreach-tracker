export type ProcessedGmailOutcome = "matched" | "no_match" | "skipped" | "error";

export interface ProcessedGmailMessage {
  id: string;
  userId: string;
  gmailMessageId: string;
  threadId?: string;
  processedAt: string;
  outcome: ProcessedGmailOutcome;
  extractedName?: string;
  subject?: string;
  matchedLeadId?: string | null;
  errorMessage?: string;
}

export interface GmailSyncMatch {
  leadId: string;
  leadName: string;
  gmailMessageId: string;
  extractedName: string;
}

export interface GmailSyncResult {
  processed: number;
  matched: number;
  noMatch: number;
  skipped: number;
  errors: { gmailMessageId: string; message: string }[];
  matches: GmailSyncMatch[];
}

export interface AcceptanceEmail {
  id: string;
  threadId: string;
  subject: string;
  snippet: string;
  date: string;
  extractedName: string;
  acceptedAt: string;
}
