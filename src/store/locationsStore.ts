import { create } from "zustand";
import { KiteSpotLocation } from "@/types/model/Location";

/**
 * Pure catalog of kite spots loaded from GET /api/locations. Does not track which
 * location is currently selected - see useSelectedLocation, which combines this store's
 * `locations` with weatherDataStore's `selectedLocation` id.
 */
interface LocationsState {
  locations: KiteSpotLocation[];
  isLocationsLoading: boolean;
  locationsError: string | null;

  setLocations: (locations: KiteSpotLocation[]) => void;
  setLocationsError: (error: string | null) => void;
  setIsLocationsLoading: (value: boolean) => void;
}

export const useLocationsStore = create<LocationsState>((set) => ({
  locations: [],
  isLocationsLoading: true,
  locationsError: null,
  setLocations: (locations: KiteSpotLocation[]) => {
    set(() => ({ locations }));
  },
  setLocationsError: (error: string | null) => {
    set(() => ({ locationsError: error }));
  },
  setIsLocationsLoading: (value: boolean) => {
    set(() => ({ isLocationsLoading: value }));
  },
}));
