import axios from "axios";
import { ChatMessage, UserWindPreferences } from "@/types/model/Chat";

export interface ChatApiErrorPayload {
  error: string;
}

/** Sends one chat turn to POST /api/chat and returns the assistant's reply text. */
export const sendChatMessage = async (
  message: string,
  history: ChatMessage[],
  preferences: UserWindPreferences
): Promise<string> => {
  const response = await axios.post("/api/chat", { message, history, preferences });
  return response.data.reply;
};

export const getChatApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as ChatApiErrorPayload | undefined;
    if (payload?.error) {
      return payload.error;
    }
  }
  return "Something went wrong talking to the chat assistant. Please try again.";
};
