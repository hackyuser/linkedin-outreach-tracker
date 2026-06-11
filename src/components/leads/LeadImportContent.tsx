"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import ImportPreviewTable from "@/components/leads/ImportPreviewTable";
import { useLeads } from "@/contexts/LeadsContext";
import { useLeadImport } from "@/hooks/useLeadImport";

export default function LeadImportContent() {
  const router = useRouter();
  const { refetch } = useLeads();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    preview,
    parsing,
    importing,
    parseError,
    importResult,
    parseFile,
    importValidRows,
    reset,
  } = useLeadImport();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await parseFile(file);
    }
  };

  const handleImport = async () => {
    const result = await importValidRows();
    if (result && result.successCount > 0) {
      await refetch();
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="text-sm font-semibold text-slate-900">Upload file</h2>
        <p className="mt-1 text-sm text-slate-500">
          Upload a CSV or XLSX file with columns:{" "}
          <span className="font-medium">Name</span> (required),{" "}
          <span className="font-medium">Company</span> (optional),{" "}
          <span className="font-medium">LinkedIn URL</span> (optional).
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={parsing || importing}
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {parsing ? "Parsing..." : "Choose File"}
          </button>
          {preview && (
            <button
              type="button"
              onClick={() => {
                reset();
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              disabled={importing}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
            >
              Clear
            </button>
          )}
        </div>

        {parseError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {parseError}
          </div>
        )}
      </div>

      {preview && (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
              <p className="text-xs font-medium uppercase text-slate-500">
                Ready to import
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">
                {preview.validRows.length}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
              <p className="text-xs font-medium uppercase text-slate-500">
                Invalid rows
              </p>
              <p className="mt-1 text-2xl font-bold text-red-600">
                {preview.invalidRows.length}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
              <p className="text-xs font-medium uppercase text-slate-500">
                Empty rows skipped
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-600">
                {preview.skippedEmptyCount}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
              <p className="text-xs font-medium uppercase text-slate-500">
                Default status
              </p>
              <p className="mt-1 text-lg font-semibold text-orange-700">
                Pending
              </p>
            </div>
          </div>

          <ImportPreviewTable
            rows={preview.validRows}
            title={`Valid rows (${preview.validRows.length})`}
          />

          {preview.invalidRows.length > 0 && (
            <ImportPreviewTable
              rows={preview.invalidRows}
              title={`Invalid rows (${preview.invalidRows.length})`}
              showErrors
            />
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleImport}
              disabled={
                importing || preview.validRows.length === 0 || !!importResult
              }
              className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {importing
                ? "Importing..."
                : `Import ${preview.validRows.length} leads`}
            </button>
          </div>
        </>
      )}

      {importResult && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
          <h2 className="text-sm font-semibold text-slate-900">Import complete</h2>
          <div className="mt-4 flex gap-8">
            <div>
              <p className="text-xs font-medium uppercase text-slate-500">
                Success
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">
                {importResult.successCount}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-slate-500">
                Failed
              </p>
              <p className="mt-1 text-2xl font-bold text-red-600">
                {importResult.failureCount}
              </p>
            </div>
          </div>
          {importResult.failures.length > 0 && (
            <ul className="mt-4 space-y-1 text-sm text-red-600">
              {importResult.failures.map((failure) => (
                <li key={`${failure.rowNumber}-${failure.message}`}>
                  Row {failure.rowNumber}: {failure.message}
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={() => router.push("/leads")}
            className="mt-6 rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            View leads
          </button>
        </div>
      )}
    </div>
  );
}
