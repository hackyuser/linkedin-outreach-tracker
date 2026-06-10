"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchGmailMessageSummaries,
  filterLinkedInMessages,
  formatGmailDate,
  type GmailMessageSummary,
} from "@/lib/gmail/client";

export default function GmailTestPage() {
  const { gmailAccessToken } = useAuth();
  const [messages, setMessages] = useState<GmailMessageSummary[]>([]);
  const [hasFetched, setHasFetched] = useState(false);
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
    setMessages([]);
    setHasFetched(false);

    try {
      const summaries = await fetchGmailMessageSummaries(gmailAccessToken);
      setMessages(filterLinkedInMessages(summaries));
      setHasFetched(true);
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
      <div className="mx-auto max-w-3xl space-y-6">
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

          {loading && (
            <div className="mt-4 flex items-center gap-3 text-sm text-slate-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
              Searching Gmail for LinkedIn emails...
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {messages.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white shadow-card">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-sm font-semibold text-slate-900">
                LinkedIn Messages ({messages.length})
              </h2>
            </div>
            <ul className="divide-y divide-slate-100">
              {messages.map((message) => (
                <li key={message.id} className="px-6 py-4">
                  <p className="font-medium text-slate-900">{message.subject}</p>
                  <div className="mt-1 flex flex-col gap-1 text-sm text-slate-600 sm:flex-row sm:items-center sm:gap-4">
                    <span className="truncate">{message.from}</span>
                    <span className="hidden text-slate-300 sm:inline">•</span>
                    <span className="shrink-0 text-slate-500">
                      {formatGmailDate(message.date)}
                    </span>
                  </div>
                  {message.snippet !== "—" && (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                      {message.snippet}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!loading && hasFetched && messages.length === 0 && !error && (
          <p className="text-center text-sm text-slate-500">
            No LinkedIn emails found
          </p>
        )}

        {!loading && !hasFetched && !error && gmailAccessToken && (
          <p className="text-center text-sm text-slate-400">
            Click the button above to search Gmail for LinkedIn emails (up to
            20).
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}
