"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Lead, LeadStatus } from "@/types/lead";
import { LEAD_STATUSES } from "@/types/lead";
import { formatDate } from "@/lib/utils";
import StatusBadge from "./StatusBadge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface LeadTableProps {
  leads: Lead[];
  onStatusChange?: (leadId: string, status: LeadStatus) => Promise<void>;
  onDelete?: (leadId: string) => Promise<void>;
}

export default function LeadTable({
  leads,
  onStatusChange,
  onDelete,
}: LeadTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "All">("All");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

  const hasActiveFilters = search !== "" || statusFilter !== "All";

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();

    return leads.filter((lead) => {
      const matchesSearch =
        query === "" ||
        lead.fullName.toLowerCase().includes(query) ||
        lead.company.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || lead.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leads, search, statusFilter]);

  const handleStatusChange = async (leadId: string, status: LeadStatus) => {
    if (!onStatusChange) return;
    setUpdatingId(leadId);
    try {
      await onStatusChange(leadId, status);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!onDelete || !leadToDelete) return;
    setDeletingId(leadToDelete.id);
    try {
      await onDelete(leadToDelete.id);
      setLeadToDelete(null);
    } finally {
      setDeletingId(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
  };

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white shadow-card">
        {/* Toolbar */}
        <div className="border-b border-slate-200 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1 sm:max-w-md">
                <label
                  htmlFor="lead-search"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500"
                >
                  Search
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                  <input
                    id="lead-search"
                    type="text"
                    placeholder="Search by name or company..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label="Clear search"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="sm:w-52">
                <label
                  htmlFor="status-filter"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500"
                >
                  Filter by Status
                </label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as LeadStatus | "All")
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="All">All Statuses</option>
                  {LEAD_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3">Lead</th>
                <th className="px-6 py-3">Company</th>
                <th className="px-6 py-3">Designation</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Invited</th>
                <th className="px-6 py-3">Accepted</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="mx-auto max-w-sm">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                      </div>
                      <p className="mt-4 font-medium text-slate-900">
                        {leads.length === 0
                          ? "No leads yet"
                          : "No matching leads"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {leads.length === 0
                          ? "Add your first lead to start tracking outreach."
                          : "Try adjusting your search or status filter."}
                      </p>
                      {leads.length === 0 && (
                        <Link
                          href="/leads/add"
                          className="mt-4 inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
                        >
                          Add Lead
                        </Link>
                      )}
                      {hasActiveFilters && leads.length > 0 && (
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="mt-4 text-sm font-medium text-brand-600 hover:text-brand-700"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="group transition-colors hover:bg-slate-50/80"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{lead.fullName}</p>
                      {lead.notes && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">
                          {lead.notes}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{lead.company}</td>
                    <td className="px-6 py-4 text-slate-600">{lead.designation}</td>
                    <td className="px-6 py-4">
                      {onStatusChange ? (
                        <div className="flex items-center gap-2">
                          <StatusBadge status={lead.status} />
                          <select
                            value={lead.status}
                            disabled={updatingId === lead.id}
                            onChange={(e) =>
                              handleStatusChange(
                                lead.id,
                                e.target.value as LeadStatus
                              )
                            }
                            aria-label={`Change status for ${lead.fullName}`}
                            className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-xs text-slate-600 opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100 disabled:opacity-50"
                          >
                            {LEAD_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <StatusBadge status={lead.status} />
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatDate(lead.invitationSentDate)}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatDate(lead.acceptedDate)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/leads/${lead.id}/edit`}
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-brand-50 hover:text-brand-600"
                          title="Edit lead"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </Link>
                        <Link
                          href={lead.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-600"
                          title="Open LinkedIn profile"
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                        </Link>
                        {onDelete && (
                          <button
                            type="button"
                            disabled={deletingId === lead.id}
                            onClick={() => setLeadToDelete(lead)}
                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            title="Delete lead"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3 text-xs text-slate-500">
          <span>
            Showing {filteredLeads.length} of {leads.length} lead
            {leads.length !== 1 ? "s" : ""}
          </span>
          {hasActiveFilters && (
            <span className="text-brand-600">Filters active</span>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={leadToDelete !== null}
        title="Delete lead"
        description={
          leadToDelete
            ? `Are you sure you want to delete ${leadToDelete.fullName} from ${leadToDelete.company}? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deletingId !== null}
        onConfirm={handleConfirmDelete}
        onCancel={() => setLeadToDelete(null)}
      />
    </>
  );
}
