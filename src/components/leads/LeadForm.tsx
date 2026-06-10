"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LeadFormData } from "@/types/lead";
import { LEAD_STATUSES } from "@/types/lead";
import { useLeads } from "@/hooks/useLeads";

const initialFormData: LeadFormData = {
  fullName: "",
  company: "",
  designation: "",
  linkedinUrl: "",
  status: "Lead Added",
  notes: "",
};

interface LeadFormProps {
  mode?: "create" | "edit";
  leadId?: string;
  initialData?: LeadFormData;
}

export default function LeadForm({
  mode = "create",
  leadId,
  initialData,
}: LeadFormProps) {
  const router = useRouter();
  const { addLead, editLead } = useLeads();
  const [formData, setFormData] = useState<LeadFormData>(
    initialData ?? initialFormData
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = mode === "edit";

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (isEdit && leadId) {
        await editLead(leadId, formData);
      } else {
        await addLead(formData);
      }
      router.push("/leads");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEdit
            ? "Failed to update lead"
            : "Failed to save lead"
      );
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="fullName"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Jane Smith"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div>
          <label
            htmlFor="company"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Company <span className="text-red-500">*</span>
          </label>
          <input
            id="company"
            name="company"
            type="text"
            required
            value={formData.company}
            onChange={handleChange}
            placeholder="Acme Corp"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div>
          <label
            htmlFor="designation"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Designation <span className="text-red-500">*</span>
          </label>
          <input
            id="designation"
            name="designation"
            type="text"
            required
            value={formData.designation}
            onChange={handleChange}
            placeholder="VP of Marketing"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div>
          <label
            htmlFor="linkedinUrl"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            LinkedIn URL <span className="text-red-500">*</span>
          </label>
          <input
            id="linkedinUrl"
            name="linkedinUrl"
            type="url"
            required
            value={formData.linkedinUrl}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/username"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="status"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            {LEAD_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="notes"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            value={formData.notes}
            onChange={handleChange}
            placeholder="Add any relevant notes about this lead..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-slate-200 pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? isEdit
              ? "Updating..."
              : "Saving..."
            : isEdit
              ? "Update Lead"
              : "Save Lead"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/leads")}
          className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
