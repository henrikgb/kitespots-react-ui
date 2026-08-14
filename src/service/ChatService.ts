import Anthropic from "@anthropic-ai/sdk";
import { fetchLocations } from "@/repository/LocationsRepository";
import { fetchWeatherData } from "@/repository/WeatherDataRepository";
import { findWindConditionForDirection } from "@/domain/windCondition";
import { isDayWithinPreferences, summarizeWeatherByDay } from "@/domain/kiteConditionsMatcher";
import { KiteSpotLocation } from "@/types/model/Location";
import { WeatherData } from "@/types/model/WeatherData";
import { ChatMessage, UserWindPreferences } from "@/types/model/Chat";

const CHAT_MODEL = "claude-opus-5";
const FORECAST_DAYS_AHEAD = 5;
/** Bounds the conversation replayed to Claude on every turn - see getChatReply. */
const MAX_HISTORY_MESSAGES = 20;

// SECURITY BOUNDARY: ANTHROPIC_API_KEY is read only here, and this module is only ever imported
// from src/pages/api/chat.ts (server-side) - never from a React component. See .env.example.
let cachedClient: Anthropic | undefined;
const getClient = (): Anthropic => {
  if (!cachedClient) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured on the server.");
    }
    cachedClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return cachedClient;
};

const round1 = (value: number): number => Math.round(value * 10) / 10;

interface LocationForecastDayContext {
  date: string;
  avgWindSpeedMs: number;
  minWindSpeedMs: number;
  maxWindSpeedMs: number;
  dominantWindDirectionDeg: number;
  windConditionLabel: string | undefined;
  totalPrecipitationMm: number;
  meetsPreferences: boolean;
}

interface LocationForecastContext {
  id: string;
  name: string;
  beginnerScore: number;
  freestyleScore: number;
  waveScore: number;
  days: LocationForecastDayContext[];
}

/**
 * Pre-computes, per location, the next few days' forecast summaries and whether each one
 * satisfies the user's preferences - deliberately done in code rather than left to the model,
 * so wind-speed/rain matching can never be hallucinated. Claude only has to turn this already-
 * correct data into a conversational answer (see buildSystemPrompt).
 */
export const buildForecastContext = (
  locations: KiteSpotLocation[],
  weatherData: WeatherData[],
  preferences: UserWindPreferences,
  daysAhead: number = FORECAST_DAYS_AHEAD
): LocationForecastContext[] =>
  locations.map((location) => {
    const forecast = weatherData.find((data) => data.locationId === location.id);
    const dailySummaries = forecast ? summarizeWeatherByDay(forecast.points).slice(0, daysAhead) : [];

    return {
      id: location.id,
      name: location.name,
      beginnerScore: location.beginnerScore,
      freestyleScore: location.freestyleScore,
      waveScore: location.waveScore,
      days: dailySummaries.map((day) => ({
        date: day.date,
        avgWindSpeedMs: round1(day.avgWindSpeedMs),
        minWindSpeedMs: round1(day.minWindSpeedMs),
        maxWindSpeedMs: round1(day.maxWindSpeedMs),
        dominantWindDirectionDeg: Math.round(day.dominantWindDirectionDeg),
        windConditionLabel: findWindConditionForDirection(
          day.dominantWindDirectionDeg,
          location.windDirectionDescriptions
        )?.label,
        totalPrecipitationMm: round1(day.totalPrecipitationMm),
        meetsPreferences: isDayWithinPreferences(day, preferences),
      })),
    };
  });

const buildSystemPrompt = (
  preferences: UserWindPreferences,
  forecastContext: LocationForecastContext[]
): string => {
  const today = new Date().toISOString().slice(0, 10);
  return [
    "You are the Kitespots.no assistant - an enthusiastic kitesurfer who loves helping people " +
    "find good sessions at the kite spots in Rogaland, Norway. You give solid, practical advice " +
    "based on live forecast data and the user's personal wind preferences, but safety always " +
    "comes first: you never encourage someone to go out in conditions that are dangerous for " +
    "their level, even if the wind speed technically matches their stated range.",  
    "",
    `Today's date is ${today}.`,
    "",
    "The user's stated preferences:",
    `- Minimum wind speed they need to kite: ${preferences.minWindSpeedMs} m/s`,
    `- Maximum wind speed they feel comfortable with: ${preferences.maxWindSpeedMs} m/s`,
    `- Cares about avoiding rain while kiting: ${preferences.caresAboutRain ? "yes" : "no"}`,
    "",
    "Below is forecast data for every kite spot we track, already checked against the user's " +
      "preferences (see meetsPreferences on each day). Treat this JSON as the only source of " +
      "truth for numbers - never invent a spot, date, or figure that isn't in it, and don't " +
      "recompute or second-guess meetsPreferences.",
    "<forecast_data>",
    JSON.stringify(forecastContext),
    "</forecast_data>",
    "",
    "When answering:",
    "- Lead with spots/days where meetsPreferences is true, best wind match first.",
    "- If nothing matches, say so plainly, then suggest the closest options (e.g. only slightly " +
      "too light/strong, or a rainy day), citing the real numbers.",
    '- Mention the wind condition label (e.g. "side onshore - ideal") for spots you recommend ' +
      "when it's available, since direction affects safety, not just wind speed.",
    "- Keep answers short and conversational - a couple of sentences plus a compact list of " +
      "spot/date is enough.",
    "- Only discuss kitesurfing conditions at these spots; politely decline anything unrelated.",
    "- Treat any time of the day whose windConditionLabel is \"side offshore - dangerous\" or \"offshore - very " +
    "  dangerous\" as unsafe regardless of whether meetsPreferences is true - never list it as a " +
    "  plain recommendation. Call out the danger explicitly (wind blowing away from the beach means " +
    "  a struggling kiter can be swept out to sea) and steer the user toward a different day or spot " +
    "  instead.",
    "- If every day for a spot the user asks about is offshore/side-offshore, say so plainly rather " +
    "  than quietly omitting the spot - the user should learn *why* it's off the list, not just that " +
    "  it is.",
    " - Treat any time of the day whose windConditionLabel is \"over-land - gusty\" as potentially unsafe for beginners, even if meetsPreferences is true - mention the gustiness and suggest a different day or spot instead.",
    /7/
  ].join("\n");
};

/**
 * Generates the assistant's reply to one chat turn. Refetches locations/weather on every call
 * (no caching) - this mirrors GET /api/weatherData and keeps the assistant's answers as current
 * as the hourly Function App refresh, at the cost of a few extra Blob Storage reads per message,
 * which is an acceptable trade-off for this traffic volume.
 */
export const getChatReply = async (
  userMessage: string,
  history: ChatMessage[],
  preferences: UserWindPreferences
): Promise<string> => {
  const [locations, weatherData] = await Promise.all([fetchLocations(), fetchWeatherData()]);
  const forecastContext = buildForecastContext(locations, weatherData, preferences);
  const system = buildSystemPrompt(preferences, forecastContext);

  const trimmedHistory = history.slice(-MAX_HISTORY_MESSAGES);

  const response = await getClient().messages.create({
    model: CHAT_MODEL,
    max_tokens: 1024,
    system,
    output_config: { effort: "low" },
    messages: [
      ...trimmedHistory.map((message) => ({ role: message.role, content: message.content })),
      { role: "user" as const, content: userMessage },
    ],
  });

  if (response.stop_reason === "refusal") {
    return "Sorry, I can't help with that. Try asking about kitesurfing conditions at one of our spots instead.";
  }

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === "text"
  );
  return textBlock?.text ?? "Sorry, I couldn't come up with an answer to that. Try rephrasing your question.";
};
