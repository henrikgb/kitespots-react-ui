import axios from "axios";
import { KiteSpotLocation, WindDirectionDescription } from "@/types/model/Location";
import { useLocationsStore } from "@/store/locationsStore";

export interface CreateLocationPayload {
  name: string;
  latitude: number;
  longitude: number;
  beginnerScore?: number;
  freestyleScore?: number;
  waveScore?: number;
  windDirectionDescriptions: Pick<WindDirectionDescription, "intervalStart" | "intervalStop" | "category">[];
}

export interface LocationApiErrorPayload {
  error: string;
  errors?: string[];
}

/** Creates a new location (authenticated). The server generates and returns its id. */
export const createLocation = async (payload: CreateLocationPayload): Promise<KiteSpotLocation> => {
  const response = await axios.post("/api/locations", payload);
  return response.data.data;
};

/** Uploads and attaches an image to an existing location (authenticated). */
export const uploadLocationImage = async (locationId: string, file: File): Promise<KiteSpotLocation> => {
  const response = await axios.post(`/api/locations/${encodeURIComponent(locationId)}/image`, file, {
    headers: { "Content-Type": file.type },
  });
  return response.data.data;
};

/** Deletes a location, its image, and its weather blob (authenticated). */
export const deleteLocation = async (locationId: string): Promise<void> => {
  await axios.delete(`/api/locations/${encodeURIComponent(locationId)}`);
};

/** Re-fetches the location catalog and refreshes locationsStore after an admin mutation. */
export const refreshLocations = async (): Promise<void> => {
  const response = await axios.get("/api/locations");
  useLocationsStore.getState().setLocations(response.data.data);
};

export const getLocationApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as LocationApiErrorPayload | undefined;
    if (payload?.errors?.length) {
      return payload.errors.join(" ");
    }
    if (payload?.error) {
      return payload.error;
    }
  }
  return "Something went wrong. Please try again.";
};
