import { ChatMessage, UserWindPreferences } from "@/types/model/Chat";

export interface ChatApiErrorPayload {
  error: string;
}

/**
 * Sends one chat turn to POST /api/chat and streams the assistant's reply, invoking onChunk with
 * each piece of text as it arrives. Uses fetch rather than axios because axios has no reliable
 * way to read a response body incrementally in the browser - fetch's ReadableStream does.
 */
export const sendChatMessageStream = async (
  message: string,
  history: ChatMessage[],
  preferences: UserWindPreferences,
  onChunk: (chunk: string) => void
): Promise<void> => {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history, preferences }),
  });

  if (!response.ok || !response.body) {
    throw new Error(await extractErrorMessage(response));
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    onChunk(decoder.decode(value, { stream: true }));
  }
};

/** Reads the JSON { error } body the API route sends when it fails before streaming starts. */
const extractErrorMessage = async (response: Response): Promise<string> => {
  try {
    const payload = (await response.json()) as ChatApiErrorPayload;
    if (payload?.error) {
      return payload.error;
    }
  } catch {
    // Response wasn't JSON (e.g. the connection dropped mid-stream) - fall through to default.
  }
  return "Something went wrong talking to the chat assistant. Please try again.";
};

export const getChatApiErrorMessage = (error: unknown): string =>
  error instanceof Error && error.message
    ? error.message
    : "Something went wrong talking to the chat assistant. Please try again.";
