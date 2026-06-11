const ACCEPTANCE_SUBJECT_PATTERN =
  /^(.+?)\s*,?\s*has accepted your invitation/i;

const ACCEPTANCE_SNIPPET_PATTERN =
  /(.+?)\s*,?\s*has accepted your invitation/i;

const ACCEPTANCE_GENERIC_PATTERN =
  /(.+?)\s+accepted your invitation/i;

export function normalizeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, "");
}

function cleanExtractedName(name: string): string {
  return name
    .replace(/\s+via\s+linkedin.*$/i, "")
    .replace(/\s+on\s+linkedin.*$/i, "")
    .trim();
}

export function parseAcceptanceFromSubject(subject: string): string | null {
  const trimmed = subject.trim();
  if (!trimmed) return null;

  for (const pattern of [
    ACCEPTANCE_SUBJECT_PATTERN,
    ACCEPTANCE_GENERIC_PATTERN,
  ]) {
    const match = trimmed.match(pattern);
    if (match?.[1]) {
      const name = cleanExtractedName(match[1]);
      if (name.length > 0) return name;
    }
  }

  return null;
}

export function parseAcceptanceFromSnippet(snippet: string): string | null {
  const trimmed = snippet.trim();
  if (!trimmed) return null;

  for (const pattern of [
    ACCEPTANCE_SNIPPET_PATTERN,
    ACCEPTANCE_GENERIC_PATTERN,
  ]) {
    const match = trimmed.match(pattern);
    if (match?.[1]) {
      const name = cleanExtractedName(match[1]);
      if (name.length > 0) return name;
    }
  }

  return null;
}

export function parseAcceptanceName(
  subject: string,
  snippet: string
): string | null {
  return (
    parseAcceptanceFromSubject(subject) ?? parseAcceptanceFromSnippet(snippet)
  );
}

export function isAcceptanceEmail(subject: string, snippet: string): boolean {
  const combined = `${subject} ${snippet}`.toLowerCase();
  return combined.includes("accepted your invitation");
}

export function parseEmailDateToIso(dateHeader: string): string | null {
  if (!dateHeader || dateHeader === "—") return null;

  const parsed = new Date(dateHeader);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toISOString();
}
