import type { Lead } from "@/types/lead";
import type { AcceptanceEmail, GmailSyncResult } from "@/types/gmail-sync";
import { updateLead } from "@/lib/firebase/firestore";
import {
  getProcessedGmailMessageIds,
  markGmailMessageProcessed,
} from "@/lib/firebase/processedMessages";
import { fetchGmailAcceptanceSummaries } from "@/lib/gmail/client";
import {
  isAcceptanceEmail,
  normalizeName,
  parseAcceptanceName,
  parseEmailDateToIso,
} from "@/lib/gmail/acceptanceParser";

export function findMatchingPendingLead(
  pendingLeads: Lead[],
  extractedName: string
): Lead | null {
  const normalizedExtracted = normalizeName(extractedName);
  if (!normalizedExtracted) return null;

  const exactMatches = pendingLeads.filter(
    (lead) => normalizeName(lead.fullName) === normalizedExtracted
  );

  if (exactMatches.length === 1) {
    return exactMatches[0];
  }

  if (exactMatches.length > 1) {
    return sortByNewest(exactMatches)[0];
  }

  const fuzzyMatches = pendingLeads.filter((lead) => {
    const normalizedLead = normalizeName(lead.fullName);
    return (
      normalizedExtracted.startsWith(normalizedLead) ||
      normalizedLead.startsWith(normalizedExtracted)
    );
  });

  if (fuzzyMatches.length === 1) {
    return fuzzyMatches[0];
  }

  if (fuzzyMatches.length > 1) {
    return sortByNewest(fuzzyMatches)[0];
  }

  return null;
}

function sortByNewest(leads: Lead[]): Lead[] {
  return [...leads].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function toAcceptanceEmail(message: {
  id: string;
  threadId?: string;
  subject: string;
  snippet: string;
  date: string;
}): AcceptanceEmail | null {
  if (!isAcceptanceEmail(message.subject, message.snippet)) {
    return null;
  }

  const extractedName = parseAcceptanceName(message.subject, message.snippet);
  if (!extractedName) return null;

  const acceptedAt =
    parseEmailDateToIso(message.date) ?? new Date().toISOString();

  return {
    id: message.id,
    threadId: message.threadId ?? "",
    subject: message.subject,
    snippet: message.snippet,
    date: message.date,
    extractedName,
    acceptedAt,
  };
}

export async function syncGmailAcceptances(input: {
  userId: string;
  accessToken: string;
  pendingLeads: Lead[];
}): Promise<GmailSyncResult> {
  const { userId, accessToken, pendingLeads } = input;

  const result: GmailSyncResult = {
    processed: 0,
    matched: 0,
    noMatch: 0,
    skipped: 0,
    errors: [],
    matches: [],
  };

  const [messages, processedIds] = await Promise.all([
    fetchGmailAcceptanceSummaries(accessToken),
    getProcessedGmailMessageIds(userId),
  ]);

  const pendingById = new Map(
    pendingLeads
      .filter((lead) => lead.status === "Pending")
      .map((lead) => [lead.id, lead])
  );
  const remainingPending = () =>
    [...pendingById.values()].filter((lead) => lead.status === "Pending");

  for (const message of messages) {
    if (processedIds.has(message.id)) {
      result.skipped += 1;
      continue;
    }

    result.processed += 1;

    const acceptance = toAcceptanceEmail(message);
    if (!acceptance) {
      await markGmailMessageProcessed(userId, {
        gmailMessageId: message.id,
        threadId: message.threadId,
        outcome: "skipped",
        subject: message.subject,
      });
      processedIds.add(message.id);
      result.skipped += 1;
      continue;
    }

    const matchedLead = findMatchingPendingLead(
      remainingPending(),
      acceptance.extractedName
    );

    if (!matchedLead) {
      await markGmailMessageProcessed(userId, {
        gmailMessageId: message.id,
        threadId: message.threadId,
        outcome: "no_match",
        extractedName: acceptance.extractedName,
        subject: message.subject,
      });
      processedIds.add(message.id);
      result.noMatch += 1;
      continue;
    }

    try {
      await updateLead(userId, matchedLead.id, {
        status: "Accepted",
        acceptedDate: acceptance.acceptedAt,
      });

      pendingById.set(matchedLead.id, {
        ...matchedLead,
        status: "Accepted",
        acceptedDate: acceptance.acceptedAt,
      });

      await markGmailMessageProcessed(userId, {
        gmailMessageId: message.id,
        threadId: message.threadId,
        outcome: "matched",
        extractedName: acceptance.extractedName,
        subject: message.subject,
        matchedLeadId: matchedLead.id,
      });
      processedIds.add(message.id);

      result.matched += 1;
      result.matches.push({
        leadId: matchedLead.id,
        leadName: matchedLead.fullName,
        gmailMessageId: message.id,
        extractedName: acceptance.extractedName,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update lead";

      await markGmailMessageProcessed(userId, {
        gmailMessageId: message.id,
        threadId: message.threadId,
        outcome: "error",
        extractedName: acceptance.extractedName,
        subject: message.subject,
        matchedLeadId: matchedLead.id,
        errorMessage,
      });
      processedIds.add(message.id);

      result.errors.push({
        gmailMessageId: message.id,
        message: errorMessage,
      });
    }
  }

  return result;
}
