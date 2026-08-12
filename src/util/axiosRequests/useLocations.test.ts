import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import axios from "axios";
import { useLocations } from "@/util/axiosRequests/useLocations";
import { useLocationsStore } from "@/store/locationsStore";
import { useWeatherDataStore } from "@/store/weatherDataStore";
import { KiteSpotLocation } from "@/types/model/Location";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

const makeLocation = (id: string): KiteSpotLocation => ({
  id,
  name: id,
  latitude: 58.5,
  longitude: 5.6,
  imageUrl: `/api/locationImage/location-images/${id}.png`,
  beginnerScore: 1,
  freestyleScore: 1,
  waveScore: 1,
  windDirectionDescriptions: [],
});

describe("useLocations", () => {
  beforeEach(() => {
    useLocationsStore.setState({ locations: [], isLocationsLoading: true, locationsError: null });
    useWeatherDataStore.setState({ selectedLocation: undefined });
    vi.resetAllMocks();
  });

  it("populates the locations store and defaults selection to the first location", async () => {
    const locations = [makeLocation("sande"), makeLocation("sola")];
    mockedAxios.get.mockResolvedValue({ data: { data: locations } });

    renderHook(() => useLocations());

    await waitFor(() => expect(useLocationsStore.getState().isLocationsLoading).toBe(false));

    expect(useLocationsStore.getState().locations).toEqual(locations);
    expect(useLocationsStore.getState().locationsError).toBeNull();
    expect(useWeatherDataStore.getState().selectedLocation).toBe("sande");
  });

  it("handles zero locations without crashing and leaves no selection", async () => {
    mockedAxios.get.mockResolvedValue({ data: { data: [] } });

    renderHook(() => useLocations());

    await waitFor(() => expect(useLocationsStore.getState().isLocationsLoading).toBe(false));

    expect(useLocationsStore.getState().locations).toEqual([]);
    expect(useWeatherDataStore.getState().selectedLocation).toBeUndefined();
  });

  it("surfaces an error message and stops loading when the API call fails", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network Error"));

    renderHook(() => useLocations());

    await waitFor(() => expect(useLocationsStore.getState().isLocationsLoading).toBe(false));

    expect(useLocationsStore.getState().locationsError).toBeTruthy();
    expect(useLocationsStore.getState().locations).toEqual([]);
  });

  it("keeps a still-valid current selection instead of resetting it to the first location", async () => {
    useWeatherDataStore.setState({ selectedLocation: "sola" });
    const locations = [makeLocation("sande"), makeLocation("sola")];
    mockedAxios.get.mockResolvedValue({ data: { data: locations } });

    renderHook(() => useLocations());

    await waitFor(() => expect(useLocationsStore.getState().isLocationsLoading).toBe(false));

    expect(useWeatherDataStore.getState().selectedLocation).toBe("sola");
  });
});
