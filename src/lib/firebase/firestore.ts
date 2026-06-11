import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  type DocumentData,
} from "firebase/firestore";
import type { BulkImportResult, Lead, LeadImportRow, LeadStatus } from "@/types/lead";
import { getFirebaseApp } from "./config";

const COLLECTION_NAME = "leads";
const BATCH_SIZE = 500;

/** Fields that must never be written by client update payloads */
const IMMUTABLE_LEAD_FIELDS = ["id", "userId", "createdAt"] as const;

function getDb() {
  return getFirestore(getFirebaseApp());
}

function assertUserId(userId: string): void {
  if (!userId) {
    throw new Error("userId is required for Firestore operations");
  }
}

function docToLead(id: string, data: DocumentData): Lead {
  return {
    id,
    fullName: data.fullName ?? "",
    company: data.company ?? "",
    designation: data.designation ?? "",
    linkedinUrl: data.linkedinUrl ?? "",
    status: data.status ?? "Lead Added",
    notes: data.notes ?? "",
    invitationSentDate: data.invitationSentDate ?? null,
    acceptedDate: data.acceptedDate ?? null,
    messageSentDate: data.messageSentDate ?? null,
    replyDate: data.replyDate ?? null,
    createdAt: data.createdAt ?? new Date().toISOString(),
    updatedAt: data.updatedAt ?? new Date().toISOString(),
  };
}

function getDateFieldsForStatus(status: LeadStatus): Partial<Lead> {
  const now = new Date().toISOString();
  const fields: Partial<Lead> = {};

  switch (status) {
    case "Invitation Sent":
      fields.invitationSentDate = now;
      break;
    case "Accepted":
      fields.acceptedDate = now;
      break;
    case "Message Sent":
      fields.messageSentDate = now;
      break;
    case "Replied":
      fields.replyDate = now;
      break;
  }

  return fields;
}

export async function getLeads(userId: string): Promise<Lead[]> {
  assertUserId(userId);
  const q = query(
    collection(getDb(), COLLECTION_NAME),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  const leads = snapshot.docs.map((d) => docToLead(d.id, d.data()));
  return leads.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getLeadById(
  userId: string,
  leadId: string
): Promise<Lead | null> {
  assertUserId(userId);
  const docRef = doc(getDb(), COLLECTION_NAME, leadId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  if (data.userId !== userId) return null;

  return docToLead(snapshot.id, data);
}

export async function createLead(
  userId: string,
  lead: Omit<Lead, "id" | "createdAt" | "updatedAt">
): Promise<Lead> {
  assertUserId(userId);
  const now = new Date().toISOString();
  const dateFields = getDateFieldsForStatus(lead.status);

  const docRef = await addDoc(collection(getDb(), COLLECTION_NAME), {
    userId,
    fullName: lead.fullName,
    company: lead.company,
    designation: lead.designation,
    linkedinUrl: lead.linkedinUrl,
    status: lead.status,
    notes: lead.notes,
    invitationSentDate: lead.invitationSentDate ?? dateFields.invitationSentDate ?? null,
    acceptedDate: lead.acceptedDate ?? dateFields.acceptedDate ?? null,
    messageSentDate: lead.messageSentDate ?? dateFields.messageSentDate ?? null,
    replyDate: lead.replyDate ?? dateFields.replyDate ?? null,
    createdAt: now,
    updatedAt: now,
  });

  return {
    id: docRef.id,
    fullName: lead.fullName,
    company: lead.company,
    designation: lead.designation,
    linkedinUrl: lead.linkedinUrl,
    status: lead.status,
    notes: lead.notes,
    invitationSentDate: lead.invitationSentDate ?? dateFields.invitationSentDate ?? null,
    acceptedDate: lead.acceptedDate ?? dateFields.acceptedDate ?? null,
    messageSentDate: lead.messageSentDate ?? dateFields.messageSentDate ?? null,
    replyDate: lead.replyDate ?? dateFields.replyDate ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateLead(
  userId: string,
  leadId: string,
  updates: Partial<Lead>
): Promise<Lead> {
  assertUserId(userId);
  const existing = await getLeadById(userId, leadId);
  if (!existing) {
    throw new Error("Lead not found");
  }

  const now = new Date().toISOString();
  const safeUpdates = { ...updates } as Record<string, unknown>;
  for (const field of IMMUTABLE_LEAD_FIELDS) {
    delete safeUpdates[field];
  }

  const firestoreUpdates: Record<string, unknown> = {
    ...safeUpdates,
    updatedAt: now,
  };

  if (updates.status && updates.status !== existing.status) {
    const dateFields = getDateFieldsForStatus(updates.status);
    if (dateFields.invitationSentDate && !existing.invitationSentDate) {
      firestoreUpdates.invitationSentDate = dateFields.invitationSentDate;
    }
    if (dateFields.acceptedDate && !existing.acceptedDate) {
      firestoreUpdates.acceptedDate = dateFields.acceptedDate;
    }
    if (dateFields.messageSentDate && !existing.messageSentDate) {
      firestoreUpdates.messageSentDate = dateFields.messageSentDate;
    }
    if (dateFields.replyDate && !existing.replyDate) {
      firestoreUpdates.replyDate = dateFields.replyDate;
    }
  }

  const docRef = doc(getDb(), COLLECTION_NAME, leadId);
  await updateDoc(docRef, firestoreUpdates);

  return {
    ...existing,
    ...safeUpdates,
    invitationSentDate:
      (firestoreUpdates.invitationSentDate as string | null | undefined) ??
      existing.invitationSentDate,
    acceptedDate:
      (firestoreUpdates.acceptedDate as string | null | undefined) ??
      existing.acceptedDate,
    messageSentDate:
      (firestoreUpdates.messageSentDate as string | null | undefined) ??
      existing.messageSentDate,
    replyDate:
      (firestoreUpdates.replyDate as string | null | undefined) ??
      existing.replyDate,
    updatedAt: now,
  };
}

export async function updateLeadStatus(
  userId: string,
  leadId: string,
  status: LeadStatus
): Promise<Lead> {
  return updateLead(userId, leadId, { status });
}

export async function deleteLead(
  userId: string,
  leadId: string
): Promise<void> {
  assertUserId(userId);
  const existing = await getLeadById(userId, leadId);
  if (!existing) {
    throw new Error("Lead not found");
  }

  await deleteDoc(doc(getDb(), COLLECTION_NAME, leadId));
}

function importRowToFirestoreDoc(
  userId: string,
  row: LeadImportRow,
  now: string,
  importBatchId: string
) {
  return {
    userId,
    fullName: row.fullName,
    company: row.company,
    designation: "",
    linkedinUrl: row.linkedinUrl,
    status: "Pending" as LeadStatus,
    notes: "",
    source: "import",
    importBatchId,
    invitationSentDate: null,
    acceptedDate: null,
    messageSentDate: null,
    replyDate: null,
    createdAt: now,
    updatedAt: now,
  };
}

export async function createLeadsBulk(
  userId: string,
  rows: LeadImportRow[],
  importBatchId: string
): Promise<BulkImportResult> {
  assertUserId(userId);

  const result: BulkImportResult = {
    successCount: 0,
    failureCount: 0,
    failures: [],
  };

  if (rows.length === 0) {
    return result;
  }

  const db = getDb();
  const collectionRef = collection(db, COLLECTION_NAME);
  const now = new Date().toISOString();

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);

    try {
      for (const row of chunk) {
        const docRef = doc(collectionRef);
        batch.set(
          docRef,
          importRowToFirestoreDoc(userId, row, now, importBatchId)
        );
      }
      await batch.commit();
      result.successCount += chunk.length;
    } catch {
      for (const row of chunk) {
        try {
          await addDoc(
            collectionRef,
            importRowToFirestoreDoc(userId, row, now, importBatchId)
          );
          result.successCount += 1;
        } catch (err) {
          result.failureCount += 1;
          result.failures.push({
            rowNumber: row.rowNumber,
            message:
              err instanceof Error ? err.message : "Failed to create lead",
          });
        }
      }
    }
  }

  return result;
}
