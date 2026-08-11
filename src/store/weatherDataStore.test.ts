import { beforeEach, describe, expect, it } from "vitest";
import { useWeatherDataStore } from "@/store/weatherDataStore";
import { WeatherData } from "@/types/model/WeatherData";

const sampleWeatherData: WeatherData[] = [
  {
    locationId: "sele",
    generatedAt: "2026-08-11T11:00:00Z",
    points: [
      { time: "2026-08-11T11:00:00Z", windSpeedMs: 7.7, windDirectionDeg: 327, windGustMs: 12.1, precipitationMm: 0 },
      { time: "2026-08-13T18:00:00Z", windSpeedMs: 5.1, windDirectionDeg: 210, windGustMs: null, precipitationMm: null },
    ],
  },
  {
    locationId: "sola",
    generatedAt: "2026-08-11T11:00:00Z",
    points: [
      { time: "2026-08-11T11:00:00Z", windSpeedMs: 3.2, windDirectionDeg: 90, windGustMs: 6.0, precipitationMm: 0.2 },
    ],
  },
];

describe("useWeatherDataStore", () => {
  beforeEach(() => {
    useWeatherDataStore.setState({
      weatherData: [],
      selectedLocation: "sele",
      windSpeed: undefined,
      windDirection: undefined,
      windGusts: undefined,
      precipitation: undefined,
      isWeatherDataLoading: true,
    });
  });

  it("derives per-series data for the default (Sele) location on setWeatherData", () => {
    useWeatherDataStore.getState().setWeatherData(sampleWeatherData);
    const state = useWeatherDataStore.getState();

    expect(state.windSpeed).toEqual([
      { date: "2026-08-11T11:00:00Z", value: 7.7 },
      { date: "2026-08-13T18:00:00Z", value: 5.1 },
    ]);
    expect(state.windGusts?.[1].value).toBeNull();
    expect(state.precipitation?.[1].value).toBeNull();
  });

  it("switches series when selecting a different location", () => {
    useWeatherDataStore.getState().setWeatherData(sampleWeatherData);
    useWeatherDataStore.getState().setSelectedLocation("sola");

    const state = useWeatherDataStore.getState();
    expect(state.selectedLocation).toBe("sola");
    expect(state.windSpeed).toEqual([{ date: "2026-08-11T11:00:00Z", value: 3.2 }]);
    expect(state.windGusts).toEqual([{ date: "2026-08-11T11:00:00Z", value: 6.0 }]);
  });

  it("clears series when selecting a location with no weather data", () => {
    useWeatherDataStore.getState().setWeatherData(sampleWeatherData);
    useWeatherDataStore.getState().setSelectedLocation("unknown-location");

    expect(useWeatherDataStore.getState().windSpeed).toBeUndefined();
  });
});
