import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ChatMessage, UserWindPreferences } from "@/types/model/Chat";

export type OnboardingStep = "minWind" | "maxWind" | "rain" | "complete";

interface ChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  preferences: UserWindPreferences | null;
  onboardingStep: OnboardingStep;
  /** Held between the minWind and rain steps, until all three answers are known at once. */
  draftMinWindSpeedMs: number | null;
  draftMaxWindSpeedMs: number | null;
  isSending: boolean;

  setOpen: (open: boolean) => void;
  addMessage: (message: ChatMessage) => void;
  /** Appends a streamed text chunk to the last message's content - see ChatComposer's use of sendChatMessageStream. */
  appendToLastMessage: (chunk: string) => void;
  setDraftMinWindSpeedMs: (value: number) => void;
  setDraftMaxWindSpeedMs: (value: number) => void;
  setOnboardingStep: (step: OnboardingStep) => void;
  setPreferences: (preferences: UserWindPreferences) => void;
  setIsSending: (value: boolean) => void;
}

// The first two turns of every conversation, always present - see ChatMessage.translationKey for
// why these carry a translation key instead of literal text.
const INITIAL_MESSAGES: ChatMessage[] = [
  { role: "assistant", content: "", isOnboarding: true, translationKey: "chatWelcome" },
  { role: "assistant", content: "", isOnboarding: true, translationKey: "chatMinWindQuestion" },
];

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      isOpen: false,
      messages: INITIAL_MESSAGES,
      preferences: null,
      onboardingStep: "minWind",
      draftMinWindSpeedMs: null,
      draftMaxWindSpeedMs: null,
      isSending: false,

      setOpen: (open) => set({ isOpen: open }),
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      appendToLastMessage: (chunk) =>
        set((state) => {
          if (state.messages.length === 0) {
            return state;
          }
          const messages = [...state.messages];
          const lastIndex = messages.length - 1;
          messages[lastIndex] = { ...messages[lastIndex], content: messages[lastIndex].content + chunk };
          return { messages };
        }),
      setDraftMinWindSpeedMs: (value) => set({ draftMinWindSpeedMs: value }),
      setDraftMaxWindSpeedMs: (value) => set({ draftMaxWindSpeedMs: value }),
      setOnboardingStep: (step) => set({ onboardingStep: step }),
      setPreferences: (preferences) => set({ preferences }),
      setIsSending: (value) => set({ isSending: value }),
    }),
    {
      name: "kitespots-chat",
      storage: createJSONStorage(() => localStorage),
      // isOpen/isSending are transient UI state - persisting them would reopen the widget (or
      // leave it stuck "sending") on the next page load, which is not what a returning user wants.
      partialize: (state) => ({
        messages: state.messages,
        preferences: state.preferences,
        onboardingStep: state.onboardingStep,
        draftMinWindSpeedMs: state.draftMinWindSpeedMs,
        draftMaxWindSpeedMs: state.draftMaxWindSpeedMs,
      }),
    }
  )
);
