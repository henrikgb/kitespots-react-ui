import React, { useState } from "react";
import { Button, Input, Typography } from "@material-tailwind/react";
import { useTranslation } from "next-i18next";
import { useChatStore } from "@/store/chatStore";
import { getChatApiErrorMessage, sendChatMessage } from "@/util/axiosRequests/chatApi";

/** Above this, a wind speed answer is almost certainly a typo, not a real value in m/s. */
const MAX_REASONABLE_WIND_SPEED_MS = 60;

const parseWindSpeed = (raw: string): number | null => {
  const value = Number(raw.replace(",", "."));
  if (!Number.isFinite(value) || value < 0 || value > MAX_REASONABLE_WIND_SPEED_MS) {
    return null;
  }
  return value;
};

/**
 * The chat's single input area. What it renders - and what submitting it does - depends on
 * onboardingStep: a number field for the two wind-speed questions, Yes/No buttons for the rain
 * question, then a free-text field wired up to POST /api/chat once onboarding is complete.
 */
export const ChatComposer = () => {
  const { t } = useTranslation();
  const {
    messages,
    onboardingStep,
    draftMinWindSpeedMs,
    preferences,
    isSending,
    addMessage,
    setDraftMinWindSpeedMs,
    setDraftMaxWindSpeedMs,
    setOnboardingStep,
    setPreferences,
    setIsSending,
  } = useChatStore();
  const [inputValue, setInputValue] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const submitMinWind = () => {
    const value = parseWindSpeed(inputValue);
    if (value === null) {
      setValidationError(t("chatInvalidWindSpeed"));
      return;
    }
    addMessage({ role: "user", content: `${value} m/s`, isOnboarding: true, translationKey: "chatWindSpeedAnswer", translationValues: { value } });
    setDraftMinWindSpeedMs(value);
    addMessage({ role: "assistant", content: "", isOnboarding: true, translationKey: "chatMaxWindQuestion" });
    setOnboardingStep("maxWind");
    setInputValue("");
    setValidationError(null);
  };

  const submitMaxWind = () => {
    const value = parseWindSpeed(inputValue);
    if (value === null) {
      setValidationError(t("chatInvalidWindSpeed"));
      return;
    }
    if (draftMinWindSpeedMs !== null && value < draftMinWindSpeedMs) {
      setValidationError(t("chatMaxBelowMin", { min: draftMinWindSpeedMs }));
      return;
    }
    addMessage({ role: "user", content: `${value} m/s`, isOnboarding: true, translationKey: "chatWindSpeedAnswer", translationValues: { value } });
    setDraftMaxWindSpeedMs(value);
    addMessage({ role: "assistant", content: "", isOnboarding: true, translationKey: "chatRainQuestion" });
    setOnboardingStep("rain");
    setInputValue("");
    setValidationError(null);
  };

  const submitRain = (caresAboutRain: boolean) => {
    if (draftMinWindSpeedMs === null) {
      return;
    }
    // maxWind was just answered on the previous step, so it's read fresh from the store rather
    // than a prop - draftMaxWindSpeedMs is guaranteed set by the time the rain step is reachable.
    const maxWindSpeedMs = useChatStore.getState().draftMaxWindSpeedMs;
    if (maxWindSpeedMs === null) {
      return;
    }
    addMessage({
      role: "user",
      content: caresAboutRain ? "Yes" : "No",
      isOnboarding: true,
      translationKey: caresAboutRain ? "yes" : "no",
    });
    setPreferences({ minWindSpeedMs: draftMinWindSpeedMs, maxWindSpeedMs, caresAboutRain });
    addMessage({ role: "assistant", content: "", isOnboarding: true, translationKey: "chatOnboardingComplete" });
    setOnboardingStep("complete");
  };

  const submitFreeText = async () => {
    const text = inputValue.trim();
    if (!text || !preferences || isSending) {
      return;
    }
    // Captured before addMessage below - this is the conversation *before* the new turn, which
    // is exactly what POST /api/chat's `history` parameter expects (the new message is sent
    // separately as `message`).
    const history = messages.filter((message) => !message.isOnboarding);

    addMessage({ role: "user", content: text });
    setInputValue("");
    setValidationError(null);
    setIsSending(true);
    try {
      const reply = await sendChatMessage(text, history, preferences);
      addMessage({ role: "assistant", content: reply });
    } catch (error) {
      addMessage({ role: "assistant", content: getChatApiErrorMessage(error) });
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event?: React.FormEvent) => {
    event?.preventDefault();
    if (onboardingStep === "minWind") {
      submitMinWind();
    } else if (onboardingStep === "maxWind") {
      submitMaxWind();
    } else if (onboardingStep === "complete") {
      void submitFreeText();
    }
  };

  if (onboardingStep === "rain") {
    return (
      <div className="flex gap-2">
        <Button variant="outlined" className="flex-1" onClick={() => submitRain(false)} disabled={isSending}>
          {t("no")}
        </Button>
        <Button variant="filled" className="flex-1" onClick={() => submitRain(true)} disabled={isSending}>
          {t("yes")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {validationError && (
        <Typography color="red" variant="small">
          {validationError}
        </Typography>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type={onboardingStep === "complete" ? "text" : "number"}
          label={onboardingStep === "complete" ? t("chatInputPlaceholder") : t("chatWindSpeedPlaceholder")}
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          disabled={isSending}
          containerProps={{ className: "!min-w-0" }}
          className="text-base"
          data-testid="chat-input"
        />
        <Button
          type="submit"
          disabled={isSending || inputValue.trim().length === 0}
          className="w-full shrink-0 sm:w-auto"
          data-testid="chat-send"
        >
          {t("send")}
        </Button>
      </div>
    </form>
  );
};
