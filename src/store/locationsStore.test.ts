import { beforeEach, describe, expect, it } from "vitest";
import { useLocationsStore } from "@/store/locationsStore";
import { KiteSpotLocation } from "@/types/model/Location";

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

describe("useLocationsStore", () => {
  beforeEach(() => {
    useLocationsStore.setState({
      locations: [],
      isLocationsLoading: true,
      locationsError: null,
    });
  });

  it("starts empty and loading", () => {
    const state = useLocationsStore.getState();
    expect(state.locations).toEqual([]);
    expect(state.isLocationsLoading).toBe(true);
    expect(state.locationsError).toBeNull();
  });

  it("supports a dynamic number of locations, not just nine", () => {
    const locations = [makeLocation("a"), makeLocation("b"), makeLocation("c"), makeLocation("d")];
    useLocationsStore.getState().setLocations(locations);

    expect(useLocationsStore.getState().locations).toHaveLength(4);
  });

  it("supports zero locations without error", () => {
    useLocationsStore.getState().setLocations([]);

    expect(useLocationsStore.getState().locations).toEqual([]);
  });

  it("stores an error message on failure and clears loading", () => {
    useLocationsStore.getState().setLocationsError("Failed to load kite spot locations.");
    useLocationsStore.getState().setIsLocationsLoading(false);

    const state = useLocationsStore.getState();
    expect(state.locationsError).toBe("Failed to load kite spot locations.");
    expect(state.isLocationsLoading).toBe(false);
  });
});
