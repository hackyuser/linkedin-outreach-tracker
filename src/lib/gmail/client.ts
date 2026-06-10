export interface GmailMessageRef {
  id: string;
  threadId: string;
}

export interface GmailMessagesResponse {
  messages?: GmailMessageRef[];
  resultSizeEstimate?: number;
}

export interface GmailMessageHeader {
  name: string;
  value: string;
}

export interface GmailMessageDetailResponse {
  id: string;
  threadId: string;
  snippet?: string;
  payload?: {
    headers?: GmailMessageHeader[];
  };
}

export interface GmailMessageSummary {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
}

const GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1/users/me";
export const LINKEDIN_GMAIL_QUERY = "from:(linkedin.com)";
export const LINKEDIN_MESSAGE_LIST_MAX_RESULTS = 50;
export const MESSAGE_DETAIL_FETCH_LIMIT = 20;
const DETAIL_FETCH_DELAY_MS = 250;
const MAX_RATE_LIMIT_RETRIES = 3;

export class GmailApiError extends Error {
  readonly status: number;
  readonly retryAfterMs?: number;

  constructor(message: string, status: number, retryAfterMs?: number) {
    super(message);
    this.name = "GmailApiError";
    this.status = status;
    this.retryAfterMs = retryAfterMs;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRetryAfterMs(response: Response): number | undefined {
  const retryAfter = response.headers.get("Retry-After");
  if (!retryAfter) return undefined;

  const seconds = Number(retryAfter);
  if (!Number.isNaN(seconds)) {
    return seconds * 1000;
  }

  const date = Date.parse(retryAfter);
  if (!Number.isNaN(date)) {
    return Math.max(0, date - Date.now());
  }

  return undefined;
}

async function gmailFetch<T>(
  accessToken: string,
  path: string,
  attempt = 0
): Promise<T> {
  const response = await fetch(`${GMAIL_API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.ok) {
    return response.json() as Promise<T>;
  }

  const errorBody = await response.text();

  if (response.status === 429) {
    const retryAfterMs =
      parseRetryAfterMs(response) ?? Math.min(1000 * 2 ** attempt, 8000);

    if (attempt < MAX_RATE_LIMIT_RETRIES) {
      await delay(retryAfterMs);
      return gmailFetch<T>(accessToken, path, attempt + 1);
    }

    throw new GmailApiError(
      "Gmail API rate limit exceeded. Please wait a moment and try again.",
      429,
      retryAfterMs
    );
  }

  throw new GmailApiError(
    `Gmail API error (${response.status}): ${errorBody}`,
    response.status
  );
}

function getHeader(
  headers: GmailMessageHeader[] | undefined,
  name: string
): string {
  const header = headers?.find(
    (item) => item.name.toLowerCase() === name.toLowerCase()
  );
  return header?.value ?? "";
}

export function parseGmailMessageDetail(
  detail: GmailMessageDetailResponse
): GmailMessageSummary {
  const headers = detail.payload?.headers;

  return {
    id: detail.id,
    subject: getHeader(headers, "Subject") || "(No subject)",
    from: getHeader(headers, "From") || "—",
    date: getHeader(headers, "Date") || "—",
    snippet: detail.snippet?.trim() || "—",
  };
}

function parseMessageDate(dateHeader: string): number {
  const parsed = new Date(dateHeader);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

export function sortMessagesByNewest(
  messages: GmailMessageSummary[]
): GmailMessageSummary[] {
  return [...messages].sort(
    (a, b) => parseMessageDate(b.date) - parseMessageDate(a.date)
  );
}

function extractSenderEmail(from: string): string | null {
  const angleMatch = from.match(/<([^>]+)>/);
  if (angleMatch?.[1]) {
    return angleMatch[1].trim().toLowerCase();
  }

  const emailMatch = from.match(/[\w.+-]+@[\w.-]+\.\w+/);
  return emailMatch?.[0].toLowerCase() ?? null;
}

function getSenderDomain(from: string): string | null {
  const email = extractSenderEmail(from);
  if (!email) return null;

  const atIndex = email.lastIndexOf("@");
  if (atIndex === -1) return null;

  return email.slice(atIndex + 1);
}

export function isLinkedInEmail(from: string): boolean {
  const lowerFrom = from.toLowerCase();

  if (lowerFrom.includes("linkedin")) {
    return true;
  }

  const domain = getSenderDomain(from);
  return domain?.includes("linkedin.com") ?? false;
}

export function filterLinkedInMessages(
  messages: GmailMessageSummary[]
): GmailMessageSummary[] {
  return messages.filter((message) => isLinkedInEmail(message.from));
}

export function formatGmailDate(dateHeader: string): string {
  if (!dateHeader || dateHeader === "—") return "—";

  const parsed = new Date(dateHeader);
  if (Number.isNaN(parsed.getTime())) return dateHeader;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
}

export async function fetchGmailMessages(
  accessToken: string,
  options?: { query?: string; maxResults?: number }
): Promise<GmailMessagesResponse> {
  const params = new URLSearchParams({
    maxResults: String(
      options?.maxResults ?? LINKEDIN_MESSAGE_LIST_MAX_RESULTS
    ),
  });

  if (options?.query) {
    params.set("q", options.query);
  }

  return gmailFetch<GmailMessagesResponse>(
    accessToken,
    `/messages?${params.toString()}`
  );
}

export async function fetchGmailMessageDetail(
  accessToken: string,
  messageId: string
): Promise<GmailMessageDetailResponse> {
  const params = new URLSearchParams({ format: "metadata" });
  params.append("metadataHeaders", "Subject");
  params.append("metadataHeaders", "From");
  params.append("metadataHeaders", "Date");

  return gmailFetch<GmailMessageDetailResponse>(
    accessToken,
    `/messages/${messageId}?${params.toString()}`
  );
}

async function fetchMessageDetailsSequentially(
  accessToken: string,
  messageIds: string[]
): Promise<GmailMessageDetailResponse[]> {
  const details: GmailMessageDetailResponse[] = [];

  for (let index = 0; index < messageIds.length; index++) {
    const detail = await fetchGmailMessageDetail(accessToken, messageIds[index]);
    details.push(detail);

    if (index < messageIds.length - 1) {
      await delay(DETAIL_FETCH_DELAY_MS);
    }
  }

  return details;
}

export async function fetchGmailMessageSummaries(
  accessToken: string
): Promise<GmailMessageSummary[]> {
  const list = await fetchGmailMessages(accessToken, {
    query: LINKEDIN_GMAIL_QUERY,
    maxResults: LINKEDIN_MESSAGE_LIST_MAX_RESULTS,
  });

  const messageIds =
    list.messages?.map((message) => message.id).slice(0, MESSAGE_DETAIL_FETCH_LIMIT) ??
    [];

  if (messageIds.length === 0) {
    return [];
  }

  const details = await fetchMessageDetailsSequentially(accessToken, messageIds);
  const summaries = details.map(parseGmailMessageDetail);
  const linkedInMessages = filterLinkedInMessages(summaries);

  return sortMessagesByNewest(linkedInMessages);
}
