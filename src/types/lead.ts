export const LEAD_STATUSES = [
  "Pending",
  "Lead Added",
  "Invitation Sent",
  "Accepted",
  "Message Sent",
  "Replied",
  "Opportunity Created",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export interface Lead {
  id: string;
  fullName: string;
  company: string;
  designation: string;
  linkedinUrl: string;
  status: LeadStatus;
  notes: string;
  invitationSentDate: string | null;
  acceptedDate: string | null;
  messageSentDate: string | null;
  replyDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export type LeadFormData = Pick<
  Lead,
  "fullName" | "company" | "designation" | "linkedinUrl" | "status" | "notes"
>;

export interface LeadImportRow {
  rowNumber: number;
  fullName: string;
  company: string;
  linkedinUrl: string;
  isEmpty: boolean;
  isValid: boolean;
  errors: string[];
}

export interface LeadImportPreview {
  rows: LeadImportRow[];
  validRows: LeadImportRow[];
  invalidRows: LeadImportRow[];
  skippedEmptyCount: number;
}

export interface BulkImportResult {
  successCount: number;
  failureCount: number;
  failures: { rowNumber: number; message: string }[];
}
