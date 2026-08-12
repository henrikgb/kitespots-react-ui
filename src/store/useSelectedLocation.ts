import { useLocationsStore } from "@/store/locationsStore";
import { useWeatherDataStore } from "@/store/weatherDataStore";
import { KiteSpotLocation } from "@/types/model/Location";

/**
 * The single "currently selected kite spot" object, derived from the locations catalog
 * (useLocationsStore) and the selected location id (useWeatherDataStore.selectedLocation -
 * kept there since that's also what the weather series are keyed by). Returns undefined
 * while locations are still loading, on error, or if the selected id no longer exists.
 */
export const useSelectedLocation = (): KiteSpotLocation | undefined => {
  const locations = useLocationsStore((state) => state.locations);
  const selectedLocationId = useWeatherDataStore((state) => state.selectedLocation);
  return locations.find((location) => location.id === selectedLocationId);
};
