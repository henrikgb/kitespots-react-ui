/**
 * The three preferences the chat assistant collects from the user before it will answer
 * free-form questions - see src/components/chat/ChatComposer.tsx for the onboarding flow that
 * collects them and src/service/ChatService.ts for how they're used to filter forecast data.
 */
export interface UserWindPreferences {
  minWindSpeedMs: number;
  maxWindSpeedMs: number;
  caresAboutRain: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant";
  /** English fallback - always set, and the exact text sent to POST /api/chat as history. */
  content: string;
  /**
   * True for the predefined onboarding questions/answers (min/max wind speed, rain). These are
   * shown in the transcript like any other message, but are excluded when building the `history`
   * sent to POST /api/chat - the assistant already receives the resulting UserWindPreferences,
   * so re-sending the raw onboarding exchange would just waste tokens.
   */
  isOnboarding?: boolean;
  /**
   * When set, ChatMessageList renders t(translationKey, translationValues) instead of `content`.
   * Only used for the fixed onboarding question/answer templates, which live in the chat store
   * (a plain module, outside React) and so can't call useTranslation() themselves - resolving the
   * translation at render time instead of storage time means the displayed text always matches
   * the site's current language, including for messages persisted from a previous session.
   */
  translationKey?: string;
  translationValues?: Record<string, string | number>;
}
