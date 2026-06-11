import type { LeadImportRow } from "@/types/lead";

function isValidLinkedInUrl(url: string): boolean {
  if (!url) return true;
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname.includes("linkedin.com");
  } catch {
    return false;
  }
}

export function validateImportRow(
  rowNumber: number,
  fields: { fullName: string; company: string; linkedinUrl: string }
): LeadImportRow {
  const isEmpty =
    !fields.fullName && !fields.company && !fields.linkedinUrl;

  if (isEmpty) {
    return {
      rowNumber,
      fullName: "",
      company: "",
      linkedinUrl: "",
      isEmpty: true,
      isValid: false,
      errors: [],
    };
  }

  const errors: string[] = [];

  if (!fields.fullName) {
    errors.push("Name is required");
  }

  if (fields.linkedinUrl && !isValidLinkedInUrl(fields.linkedinUrl)) {
    errors.push("LinkedIn URL must be a valid linkedin.com link");
  }

  return {
    rowNumber,
    fullName: fields.fullName,
    company: fields.company,
    linkedinUrl: fields.linkedinUrl,
    isEmpty: false,
    isValid: errors.length === 0,
    errors,
  };
}
