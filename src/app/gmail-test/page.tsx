"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { fetchGmailMessages } from "@/lib/gmail/client";

export default function GmailTestPage() {
  const { gmailAccessToken } = useAuth();
  const [messageIds, setMessageIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchMessages = async () => {
    if (!gmailAccessToken) {
      setError(
        "No Gmail access token found. Sign out and sign in again to grant Gmail access."
      );
      return;
    }

    setLoading(true);
    setError(null);
    setMessageIds([]);

    try {
      const data = await fetchGmailMessages(gmailAccessToken);
      const ids = data.messages?.map((message) => message.id) ?? [];
      setMessageIds(ids);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Gmail Test"
      description="Minimal integration test for Gmail API access"
    >
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
          <p className="text-sm text-slate-600">
            {gmailAccessToken
              ? "Gmail access token is available."
              : "No Gmail access token. Sign out and sign in again to grant Gmail read access."}
          </p>

          <button
            type="button"
            onClick={handleFetchMessages}
            disabled={loading || !gmailAccessToken}
            className="mt-4 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Fetching..." : "Fetch Gmail Messages"}
          </button>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {messageIds.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
            <h2 className="text-sm font-semibold text-slate-900">
              Message IDs ({messageIds.length})
            </h2>
            <ul className="mt-4 space-y-2">
              {messageIds.map((id) => (
                <li
                  key={id}
                  className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-2 font-mono text-sm text-slate-700"
                >
                  {id}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!loading && messageIds.length === 0 && !error && gmailAccessToken && (
          <p className="text-center text-sm text-slate-400">
            Click the button above to fetch your 10 most recent Gmail message
            IDs.
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}
