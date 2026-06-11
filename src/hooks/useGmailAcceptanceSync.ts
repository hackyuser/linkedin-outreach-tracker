"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLeads } from "@/contexts/LeadsContext";
import { syncGmailAcceptances } from "@/lib/gmail/acceptanceSync";
import { GmailApiError } from "@/lib/gmail/client";
import type { GmailSyncResult } from "@/types/gmail-sync";

export function useGmailAcceptanceSync() {
  const { user, gmailAccessToken } = useAuth();
  const { leads, refetch } = useLeads();
  const [syncing, setSyncing] = useState(false);
  const [lastResult, setLastResult] = useState<GmailSyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sync = useCallback(async () => {
    if (!user) {
      setError("You must be signed in to sync Gmail acceptances.");
      return null;
    }

    if (!gmailAccessToken) {
      setError(
        "No Gmail access token found. Sign out and sign in again to grant Gmail access."
      );
      return null;
    }

    setSyncing(true);
    setError(null);

    try {
      const pendingLeads = leads.filter((lead) => lead.status === "Pending");
      const result = await syncGmailAcceptances({
        userId: user.uid,
        accessToken: gmailAccessToken,
        pendingLeads,
      });

      setLastResult(result);
      await refetch();
      return result;
    } catch (err) {
      if (err instanceof GmailApiError && err.status === 401) {
        setError(
          "Gmail access expired. Sign out and sign in again to grant Gmail access."
        );
      } else {
        setError(
          err instanceof Error ? err.message : "Failed to sync Gmail acceptances"
        );
      }
      return null;
    } finally {
      setSyncing(false);
    }
  }, [user, gmailAccessToken, leads, refetch]);

  return {
    sync,
    syncing,
    lastResult,
    error,
    hasGmailToken: Boolean(gmailAccessToken),
  };
}
