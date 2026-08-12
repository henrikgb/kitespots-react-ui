import { describe, expect, it } from "vitest";
import { collectAvailableWeatherData, parseWeatherDataBlob } from "@/repository/WeatherDataRepository";
import { WeatherData } from "@/types/model/WeatherData";

describe("parseWeatherDataBlob", () => {
  it("parses a well-formed WeatherData blob, preserving null gust/precipitation points", () => {
    const json = JSON.stringify({
      locationId: "sele",
      generatedAt: "2026-08-11T11:00:00Z",
      points: [
        { time: "2026-08-11T11:00:00Z", windSpeedMs: 7.7, windDirectionDeg: 327, windGustMs: 12.1, precipitationMm: 0 },
        { time: "2026-08-13T18:00:00Z", windSpeedMs: 5.1, windDirectionDeg: 210, windGustMs: null, precipitationMm: 1.4 },
        { time: "2026-08-21T06:00:00Z", windSpeedMs: 4.6, windDirectionDeg: 340.4, windGustMs: null, precipitationMm: null },
      ],
    });

    const result = parseWeatherDataBlob(json);

    expect(result.locationId).toBe("sele");
    expect(result.points).toHaveLength(3);
    expect(result.points[0].windGustMs).toBe(12.1);
    expect(result.points[1].windGustMs).toBeNull();
    expect(result.points[2].precipitationMm).toBeNull();
  });

  it("rejects a blob that does not match the WeatherData contract", () => {
    const legacyMeteomaticsShape = JSON.stringify({ version: "3.0", user: "x", status: "OK", data: [] });

    expect(() => parseWeatherDataBlob(legacyMeteomaticsShape)).toThrow();
  });

  it("rejects a blob missing the points array", () => {
    const malformed = JSON.stringify({ locationId: "sele", generatedAt: "2026-08-11T11:00:00Z" });

    expect(() => parseWeatherDataBlob(malformed)).toThrow();
  });
});

describe("collectAvailableWeatherData", () => {
  const sele: WeatherData = { locationId: "sele", generatedAt: "2026-08-11T11:00:00Z", points: [] };

  it("returns weather data for every location whose blob fetch succeeded", () => {
    const results: PromiseSettledResult<WeatherData>[] = [{ status: "fulfilled", value: sele }];

    expect(collectAvailableWeatherData(results, ["sele"])).toEqual([sele]);
  });

  it("omits a newly added location whose weather blob does not exist yet, without throwing", () => {
    const results: PromiseSettledResult<WeatherData>[] = [
      { status: "fulfilled", value: sele },
      { status: "rejected", reason: new Error("BlobNotFound") },
    ];

    const result = collectAvailableWeatherData(results, ["sele", "brand-new-spot"]);

    expect(result).toEqual([sele]);
  });

  it("returns an empty array when every fetch fails", () => {
    const results: PromiseSettledResult<WeatherData>[] = [
      { status: "rejected", reason: new Error("BlobNotFound") },
    ];

    expect(collectAvailableWeatherData(results, ["brand-new-spot"])).toEqual([]);
  });
});
