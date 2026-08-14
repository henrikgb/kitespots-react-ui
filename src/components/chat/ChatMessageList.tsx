import React, { useEffect, useRef } from "react";
import { Typography } from "@material-tailwind/react";
import { useTranslation } from "next-i18next";
import BeatLoader from "react-spinners/BeatLoader";
import { ChatMessage } from "@/types/model/Chat";

interface ChatMessageListProps {
  messages: ChatMessage[];
  isSending: boolean;
}

export const ChatMessageList = ({ messages, isSending }: ChatMessageListProps) => {
  const { t } = useTranslation();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isSending]);

  return (
    <div className="flex w-full flex-col gap-3 overflow-x-hidden overflow-y-auto px-1" style={{ maxHeight: "50vh" }} data-testid="chat-message-list">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`max-w-[90%] rounded-lg px-3 py-2 ${
            message.role === "assistant" ? "self-start bg-webPageContainerBody" : "self-end bg-headerColor text-white"
          }`}
        >
          <Typography className="whitespace-pre-wrap break-words" variant="small">
            {message.translationKey ? t(message.translationKey, message.translationValues) : message.content}
          </Typography>
        </div>
      ))}
      {isSending && (
        <div className="self-start rounded-lg bg-webPageContainerBody px-3 py-3">
          <BeatLoader size={6} color="#2d728f" aria-label="Loading" />
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
};
