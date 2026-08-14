import React from "react";
import { Dialog, DialogBody, DialogHeader, IconButton, Typography } from "@material-tailwind/react";
import { useTranslation } from "next-i18next";
import { useChatStore } from "@/store/chatStore";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { ChatComposer } from "@/components/chat/ChatComposer";

/**
 * A floating launcher (visible on every page, mounted once from _app.tsx) that opens a chat
 * panel where the user first answers three predefined questions about their wind/rain
 * preferences (see ChatComposer), then can freely ask which kite spots have good conditions
 * over the next few days.
 */
export const ChatWidget = () => {
  const { t } = useTranslation();
  const { isOpen, setOpen, messages, isSending } = useChatStore();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("chatOpenLabel")}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-headerColor text-white shadow-lg transition-colors hover:bg-headerButtonsSelected"
        data-testid="chat-launcher"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
          <path d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H8l-4 4V6a1 1 0 0 1 1-1z" />
        </svg>
      </button>

      <Dialog
        open={isOpen}
        handler={() => setOpen(false)}
        size="sm"
        className="m-2 w-[calc(100vw-1rem)] min-w-0 max-w-sm"
      >
        <DialogHeader className="flex items-center justify-between gap-2 p-3 sm:p-4">
          <Typography variant="h5" className="text-lg sm:text-2xl">
            {t("chatTitle")}
          </Typography>
          <IconButton
            variant="text"
            onClick={() => setOpen(false)}
            aria-label={t("cancel")}
            className="shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </IconButton>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-3 p-3 sm:gap-4 sm:p-4">
          <ChatMessageList messages={messages} isSending={isSending} />
          <ChatComposer />
        </DialogBody>
      </Dialog>
    </>
  );
};
