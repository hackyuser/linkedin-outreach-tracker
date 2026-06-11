import type { LeadImportRow } from "@/types/lead";

interface ImportPreviewTableProps {
  rows: LeadImportRow[];
  title: string;
  showErrors?: boolean;
}

export default function ImportPreviewTable({
  rows,
  title,
  showErrors = false,
}: ImportPreviewTableProps) {
  if (rows.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-card">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wider text-slate-500">
              <th className="px-6 py-3">Row</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Company</th>
              <th className="px-6 py-3">LinkedIn URL</th>
              {showErrors && <th className="px-6 py-3">Errors</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.rowNumber}>
                <td className="px-6 py-3 text-slate-500">{row.rowNumber}</td>
                <td className="px-6 py-3 font-medium text-slate-900">
                  {row.fullName || "—"}
                </td>
                <td className="px-6 py-3 text-slate-600">
                  {row.company || "—"}
                </td>
                <td className="px-6 py-3 text-slate-600">
                  {row.linkedinUrl ? (
                    <span className="block max-w-xs truncate">
                      {row.linkedinUrl}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                {showErrors && (
                  <td className="px-6 py-3 text-red-600">
                    {row.errors.join(", ")}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
