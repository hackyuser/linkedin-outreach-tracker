export interface GmailMessageRef {
  id: string;
  threadId: string;
}

export interface GmailMessagesResponse {
  messages?: GmailMessageRef[];
  resultSizeEstimate?: number;
}

export async function fetchGmailMessages(
  accessToken: string
): Promise<GmailMessagesResponse> {
  const response = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gmail API error (${response.status}): ${errorBody}`);
  }

  return response.json();
}
