import { fetchLocations } from "@/repository/LocationsRepository";
import { KiteSpotLocation } from "@/types/model/Location";

export const getLocations = async (): Promise<KiteSpotLocation[]> => {
  return await fetchLocations();
};
