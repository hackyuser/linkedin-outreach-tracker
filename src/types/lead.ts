export const LEAD_STATUSES = [
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
