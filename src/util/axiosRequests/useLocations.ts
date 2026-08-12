import { useEffect } from "react";
import axios from "axios";
import { useLocationsStore } from "@/store/locationsStore";
import { useWeatherDataStore } from "@/store/weatherDataStore";
import { KiteSpotLocation } from "@/types/model/Location";

/**
 * Fetches the kite spot catalog from GET /api/locations (server-side only - the browser
 * never talks to Blob Storage directly) and populates locationsStore. If there is no
 * currently selected location, or the previously selected one (e.g. restored from
 * sessionStorage) no longer exists, defaults selection to the first location returned -
 * there is no assumption about how many locations exist or which one is "the" default.
 */
export function useLocations() {
  const { setLocations, setIsLocationsLoading, setLocationsError } = useLocationsStore();
  const { selectedLocation, setSelectedLocation } = useWeatherDataStore();

  useEffect(() => {
    axios.get('/api/locations')
      .then((response) => {
        const locations: KiteSpotLocation[] = response.data.data;
        setLocations(locations);
        setLocationsError(null);

        const hasValidSelection = locations.some((location) => location.id === selectedLocation);
        if (!hasValidSelection && locations.length > 0) {
          setSelectedLocation(locations[0].id);
        }
      })
      .catch((error) => {
        console.error('Error fetching locations:', error);
        setLocationsError('Failed to load kite spot locations.');
      })
      .finally(() => {
        setIsLocationsLoading(false);
      });
    // Runs once on mount, matching useWeatherData - selectedLocation is only read to
    // resolve the initial default, not to re-trigger fetching on every selection change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setIsLocationsLoading, setLocations, setLocationsError, setSelectedLocation]);
}
