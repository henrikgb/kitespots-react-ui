import type { NextApiRequest, NextApiResponse } from "next";
import { streamChatReply } from "@/service/ChatService";
import { ChatMessage, UserWindPreferences } from "@/types/model/Chat";

const MAX_MESSAGE_LENGTH = 2000;

const isValidRole = (role: unknown): role is ChatMessage["role"] => role === "user" || role === "assistant";

const isValidHistory = (value: unknown): value is ChatMessage[] =>
  Array.isArray(value) &&
  value.every(
    (entry) =>
      !!entry &&
      isValidRole((entry as ChatMessage).role) &&
      typeof (entry as ChatMessage).content === "string"
  );

const isValidPreferences = (value: unknown): value is UserWindPreferences => {
  const preferences = value as UserWindPreferences | null;
  return (
    !!preferences &&
    typeof preferences.minWindSpeedMs === "number" &&
    Number.isFinite(preferences.minWindSpeedMs) &&
    preferences.minWindSpeedMs >= 0 &&
    typeof preferences.maxWindSpeedMs === "number" &&
    Number.isFinite(preferences.maxWindSpeedMs) &&
    preferences.maxWindSpeedMs >= preferences.minWindSpeedMs &&
    typeof preferences.caresAboutRain === "boolean"
  );
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { message, history, preferences } = req.body ?? {};

  if (typeof message !== "string" || message.trim().length === 0) {
    res.status(400).json({ error: "A non-empty message is required." });
    return;
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    res.status(400).json({ error: `Message is too long (max ${MAX_MESSAGE_LENGTH} characters).` });
    return;
  }
  if (!isValidPreferences(preferences)) {
    res.status(400).json({ error: "Valid wind speed and rain preferences are required." });
    return;
  }

  const validHistory = isValidHistory(history) ? history : [];

  // Headers are only committed on the first text chunk, so a failure that happens before Claude
  // starts responding (e.g. a Blob Storage read failing) can still be reported as JSON like
  // before; a failure mid-stream just ends the response, since the client has already started
  // rendering plain-text chunks by then.
  let headersSent = false;
  const ensureStreamingHeaders = () => {
    if (!headersSent) {
      headersSent = true;
      res.writeHead(200, {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Content-Type-Options": "nosniff",
      });
    }
  };

  try {
    await streamChatReply(message.trim(), validHistory, preferences, (textDelta) => {
      ensureStreamingHeaders();
      res.write(textDelta);
    });
    res.end();
  } catch (error) {
    console.error("Error generating chat reply:", error);
    if (headersSent) {
      res.end();
    } else {
      res.status(500).json({ error: "An error occurred while talking to the chat assistant." });
    }
  }
}
