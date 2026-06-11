"use client";

import { useGmailAcceptanceSync } from "@/hooks/useGmailAcceptanceSync";

export default function GmailSyncPanel() {
  const { sync, syncing, lastResult, error, hasGmailToken } =
    useGmailAcceptanceSync();

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Gmail Acceptance Sync
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Scan LinkedIn acceptance emails and update pending leads to
            Accepted.
          </p>
        </div>

        <button
          type="button"
          onClick={() => sync()}
          disabled={syncing || !hasGmailToken}
          className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {syncing ? "Syncing..." : "Sync Gmail Acceptances"}
        </button>
      </div>

      {!hasGmailToken && (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          No Gmail access token. Sign out and sign in again to grant Gmail read
          access.
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {lastResult && (
        <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p>
            <span className="font-medium text-slate-900">
              {lastResult.matched}
            </span>{" "}
            lead{lastResult.matched === 1 ? "" : "s"} updated,{" "}
            <span className="font-medium text-slate-900">
              {lastResult.skipped}
            </span>{" "}
            skipped,{" "}
            <span className="font-medium text-slate-900">
              {lastResult.noMatch}
            </span>{" "}
            unmatched
            {lastResult.errors.length > 0 && (
              <>
                ,{" "}
                <span className="font-medium text-red-700">
                  {lastResult.errors.length}
                </span>{" "}
                error{lastResult.errors.length === 1 ? "" : "s"}
              </>
            )}
            .
          </p>

          {lastResult.matches.length > 0 && (
            <ul className="list-disc space-y-1 pl-5">
              {lastResult.matches.map((match) => (
                <li key={match.gmailMessageId}>
                  {match.leadName} accepted (from &quot;{match.extractedName}
                  &quot;)
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
