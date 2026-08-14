import { WeatherPoint } from "@/types/model/WeatherData";
import { UserWindPreferences } from "@/types/model/Chat";

/**
 * Total daily precipitation (mm) at/under which a day counts as "dry enough" for a user who
 * cares about rain. Kept as a named constant rather than 0 because Yr's precipitation figures
 * are never exactly zero even on a dry day.
 */
const DRY_DAY_MAX_PRECIPITATION_MM = 1;

export interface DailyForecastSummary {
  /** UTC calendar date (YYYY-MM-DD) the forecast points in this bucket fall on. */
  date: string;
  avgWindSpeedMs: number;
  minWindSpeedMs: number;
  maxWindSpeedMs: number;
  /** Circular mean of windDirectionDeg across the day's points - see circularMeanDegrees. */
  dominantWindDirectionDeg: number;
  totalPrecipitationMm: number;
}

const toRadians = (deg: number) => (deg * Math.PI) / 180;
const toDegrees = (rad: number) => (rad * 180) / Math.PI;

/**
 * Circular mean of a set of compass directions in degrees. A plain arithmetic mean is wrong for
 * directions - e.g. averaging 350deg and 10deg should give 0deg, not 180deg - so this averages
 * the unit vectors (sin/cos) instead and converts back with atan2.
 */
export const circularMeanDegrees = (degrees: number[]): number => {
  const sumSin = degrees.reduce((sum, deg) => sum + Math.sin(toRadians(deg)), 0);
  const sumCos = degrees.reduce((sum, deg) => sum + Math.cos(toRadians(deg)), 0);
  const meanDeg = toDegrees(Math.atan2(sumSin / degrees.length, sumCos / degrees.length));
  return meanDeg < 0 ? meanDeg + 360 : meanDeg;
};

/**
 * Buckets a location's hourly forecast points into per-day summaries, ordered chronologically.
 * Points are bucketed by the UTC calendar date of their `time` timestamp (WeatherPoint.time is
 * always a UTC ISO string, as written by the Function App).
 */
export const summarizeWeatherByDay = (points: WeatherPoint[]): DailyForecastSummary[] => {
  const pointsByDate = new Map<string, WeatherPoint[]>();
  for (const point of points) {
    const date = point.time.slice(0, 10);
    const bucket = pointsByDate.get(date);
    if (bucket) {
      bucket.push(point);
    } else {
      pointsByDate.set(date, [point]);
    }
  }

  return Array.from(pointsByDate.entries())
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, dayPoints]) => {
      const windSpeeds = dayPoints.map((point) => point.windSpeedMs);
      // precipitationMm is only ever null for the trailing boundary timestamp of the forecast
      // horizon - excluded here rather than treated as 0, so it can't mask real rain elsewhere
      // in the day, nor falsely zero out a day that's otherwise entirely dry.
      const precipitationValues = dayPoints
        .map((point) => point.precipitationMm)
        .filter((value): value is number => value !== null);

      return {
        date,
        avgWindSpeedMs: windSpeeds.reduce((sum, value) => sum + value, 0) / windSpeeds.length,
        minWindSpeedMs: Math.min(...windSpeeds),
        maxWindSpeedMs: Math.max(...windSpeeds),
        dominantWindDirectionDeg: circularMeanDegrees(dayPoints.map((point) => point.windDirectionDeg)),
        totalPrecipitationMm: precipitationValues.reduce((sum, value) => sum + value, 0),
      };
    });
};

/**
 * Whether a day's forecast satisfies the user's stated wind/rain preferences. Wind is checked
 * against the day's average speed (not min/max) so a single gusty or lull hour doesn't
 * disqualify/qualify an otherwise-good day.
 */
export const isDayWithinPreferences = (
  day: DailyForecastSummary,
  preferences: UserWindPreferences
): boolean => {
  const windOk =
    day.avgWindSpeedMs >= preferences.minWindSpeedMs && day.avgWindSpeedMs <= preferences.maxWindSpeedMs;
  const rainOk = !preferences.caresAboutRain || day.totalPrecipitationMm <= DRY_DAY_MAX_PRECIPITATION_MM;
  return windOk && rainOk;
};
