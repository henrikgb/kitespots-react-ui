import { describe, expect, it } from "vitest";
import { circularMeanDegrees, isDayWithinPreferences, summarizeWeatherByDay } from "@/domain/kiteConditionsMatcher";
import { WeatherPoint } from "@/types/model/WeatherData";

const point = (overrides: Partial<WeatherPoint>): WeatherPoint => ({
  time: "2026-08-14T12:00:00Z",
  windSpeedMs: 8,
  windDirectionDeg: 180,
  windGustMs: null,
  precipitationMm: 0,
  ...overrides,
});

describe("circularMeanDegrees", () => {
  it("averages directions that straddle 0/360 correctly", () => {
    // The true mean is exactly on the 0/360 seam, so floating-point rounding can land the
    // result on either side (e.g. 359.999999... instead of 0.000000...1) - both are the same
    // compass direction, so compare circular distance to 0 rather than raw numeric closeness.
    const result = circularMeanDegrees([350, 10]);
    expect(Math.min(result, 360 - result)).toBeCloseTo(0, 5);
  });

  it("matches the plain average for directions that don't straddle the wrap-around", () => {
    expect(circularMeanDegrees([90, 180])).toBeCloseTo(135, 5);
  });
});

describe("summarizeWeatherByDay", () => {
  it("buckets points by UTC calendar date and computes per-day stats", () => {
    const points = [
      point({ time: "2026-08-14T06:00:00Z", windSpeedMs: 6, windDirectionDeg: 90, precipitationMm: 0.2 }),
      point({ time: "2026-08-14T12:00:00Z", windSpeedMs: 10, windDirectionDeg: 90, precipitationMm: 0.3 }),
      point({ time: "2026-08-15T06:00:00Z", windSpeedMs: 14, windDirectionDeg: 270, precipitationMm: 0 }),
    ];

    const days = summarizeWeatherByDay(points);

    expect(days).toHaveLength(2);
    expect(days[0]).toMatchObject({
      date: "2026-08-14",
      avgWindSpeedMs: 8,
      minWindSpeedMs: 6,
      maxWindSpeedMs: 10,
      totalPrecipitationMm: 0.5,
    });
    expect(days[1].date).toBe("2026-08-15");
  });

  it("returns days sorted chronologically regardless of input order", () => {
    const points = [
      point({ time: "2026-08-16T06:00:00Z" }),
      point({ time: "2026-08-14T06:00:00Z" }),
      point({ time: "2026-08-15T06:00:00Z" }),
    ];
    expect(summarizeWeatherByDay(points).map((day) => day.date)).toEqual([
      "2026-08-14",
      "2026-08-15",
      "2026-08-16",
    ]);
  });

  it("excludes null precipitation points from the sum rather than treating them as 0", () => {
    const points = [
      point({ time: "2026-08-14T06:00:00Z", precipitationMm: null }),
      point({ time: "2026-08-14T12:00:00Z", precipitationMm: 1.5 }),
    ];
    expect(summarizeWeatherByDay(points)[0].totalPrecipitationMm).toBe(1.5);
  });
});

describe("isDayWithinPreferences", () => {
  const day = {
    date: "2026-08-14",
    avgWindSpeedMs: 10,
    minWindSpeedMs: 8,
    maxWindSpeedMs: 12,
    dominantWindDirectionDeg: 180,
    totalPrecipitationMm: 0,
  };

  it("matches when average wind speed is within range and there's no rain concern", () => {
    expect(isDayWithinPreferences(day, { minWindSpeedMs: 6, maxWindSpeedMs: 14, caresAboutRain: false })).toBe(
      true
    );
  });

  it("rejects when average wind speed is outside the user's range", () => {
    expect(
      isDayWithinPreferences(day, { minWindSpeedMs: 11, maxWindSpeedMs: 14, caresAboutRain: false })
    ).toBe(false);
  });

  it("rejects a rainy day when the user cares about rain, even with perfect wind", () => {
    const rainyDay = { ...day, totalPrecipitationMm: 5 };
    expect(
      isDayWithinPreferences(rainyDay, { minWindSpeedMs: 6, maxWindSpeedMs: 14, caresAboutRain: true })
    ).toBe(false);
  });

  it("ignores rain when the user doesn't care about it", () => {
    const rainyDay = { ...day, totalPrecipitationMm: 5 };
    expect(
      isDayWithinPreferences(rainyDay, { minWindSpeedMs: 6, maxWindSpeedMs: 14, caresAboutRain: false })
    ).toBe(true);
  });
});
