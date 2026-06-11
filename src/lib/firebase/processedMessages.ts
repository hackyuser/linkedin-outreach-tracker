import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  where,
  type DocumentData,
} from "firebase/firestore";
import type {
  ProcessedGmailMessage,
  ProcessedGmailOutcome,
} from "@/types/gmail-sync";
import { getFirebaseApp } from "./config";

const COLLECTION_NAME = "processedGmailMessages";

function getDb() {
  return getFirestore(getFirebaseApp());
}

function assertUserId(userId: string): void {
  if (!userId) {
    throw new Error("userId is required for Firestore operations");
  }
}

export function processedMessageDocId(
  userId: string,
  gmailMessageId: string
): string {
  return `${userId}__${gmailMessageId}`;
}

function docToProcessedMessage(
  id: string,
  data: DocumentData
): ProcessedGmailMessage {
  return {
    id,
    userId: data.userId ?? "",
    gmailMessageId: data.gmailMessageId ?? "",
    threadId: data.threadId,
    processedAt: data.processedAt ?? new Date().toISOString(),
    outcome: data.outcome ?? "skipped",
    extractedName: data.extractedName,
    subject: data.subject,
    matchedLeadId: data.matchedLeadId ?? null,
    errorMessage: data.errorMessage,
  };
}

export async function getProcessedGmailMessageIds(
  userId: string
): Promise<Set<string>> {
  assertUserId(userId);

  const q = query(
    collection(getDb(), COLLECTION_NAME),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);

  return new Set(
    snapshot.docs.map((document) => document.data().gmailMessageId as string)
  );
}

export async function isGmailMessageProcessed(
  userId: string,
  gmailMessageId: string
): Promise<boolean> {
  assertUserId(userId);

  const docRef = doc(
    getDb(),
    COLLECTION_NAME,
    processedMessageDocId(userId, gmailMessageId)
  );
  const snapshot = await getDoc(docRef);
  return snapshot.exists();
}

export async function markGmailMessageProcessed(
  userId: string,
  input: {
    gmailMessageId: string;
    threadId?: string;
    outcome: ProcessedGmailOutcome;
    extractedName?: string;
    subject?: string;
    matchedLeadId?: string | null;
    errorMessage?: string;
  }
): Promise<ProcessedGmailMessage> {
  assertUserId(userId);

  const now = new Date().toISOString();
  const id = processedMessageDocId(userId, input.gmailMessageId);
  const data = {
    userId,
    gmailMessageId: input.gmailMessageId,
    threadId: input.threadId,
    processedAt: now,
    outcome: input.outcome,
    extractedName: input.extractedName,
    subject: input.subject,
    matchedLeadId: input.matchedLeadId ?? null,
    errorMessage: input.errorMessage,
  };

  const docRef = doc(getDb(), COLLECTION_NAME, id);
  await setDoc(docRef, data);

  return docToProcessedMessage(id, data);
}
