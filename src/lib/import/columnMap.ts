const NAME_HEADERS = ["name", "full name", "fullname", "full_name"];
const COMPANY_HEADERS = ["company", "organization", "organisation", "org"];
const LINKEDIN_HEADERS = [
  "linkedin url",
  "linkedinurl",
  "linkedin_url",
  "linkedin",
  "profile url",
  "profile",
];

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, " ");
}

export function mapRowToLeadFields(
  row: Record<string, string>
): { fullName: string; company: string; linkedinUrl: string } {
  const lookup = new Map<string, string>();
  for (const [key, value] of Object.entries(row)) {
    lookup.set(normalizeHeader(key), value?.trim() ?? "");
  }

  const findValue = (candidates: string[]): string => {
    for (const candidate of candidates) {
      const value = lookup.get(candidate);
      if (value) return value;
    }
    return "";
  };

  return {
    fullName: findValue(NAME_HEADERS),
    company: findValue(COMPANY_HEADERS),
    linkedinUrl: findValue(LINKEDIN_HEADERS),
  };
}
