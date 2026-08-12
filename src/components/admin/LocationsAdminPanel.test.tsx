import React from "react";
import { afterEach, describe, expect, it, vi, beforeEach } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useLocationsStore } from "@/store/locationsStore";
import { KiteSpotLocation } from "@/types/model/Location";

vi.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key}:${JSON.stringify(options)}` : key,
  }),
}));
vi.mock("@/util/axiosRequests/useLocations", () => ({ useLocations: () => undefined }));

const { deleteLocation } = vi.hoisted(() => ({ deleteLocation: vi.fn() }));
vi.mock("@/util/axiosRequests/locationAdminApi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/util/axiosRequests/locationAdminApi")>();
  return { ...actual, deleteLocation };
});

import { LocationsAdminPanel } from "@/components/admin/LocationsAdminPanel";

const location: KiteSpotLocation = {
  id: "sande",
  name: "Sande",
  latitude: 59.02,
  longitude: 5.59,
  imageUrl: undefined,
  beginnerScore: 3,
  freestyleScore: 5,
  waveScore: 5,
  windDirectionDescriptions: [],
};

describe("LocationsAdminPanel", () => {
  beforeEach(() => {
    deleteLocation.mockReset();
    useLocationsStore.setState({ locations: [location], isLocationsLoading: false, locationsError: null });
  });

  afterEach(() => {
    cleanup();
  });

  it("lists existing kite spots", () => {
    render(<LocationsAdminPanel />);

    expect(screen.getByText("Sande")).toBeTruthy();
  });

  it("shows a confirmation dialog with a clear warning before deleting, and does not delete on cancel", () => {
    render(<LocationsAdminPanel />);

    fireEvent.click(screen.getByText("deleteLocation"));

    expect(screen.getByText("confirmDeleteLocationMessage")).toBeTruthy();

    fireEvent.click(screen.getByText("cancel"));

    expect(deleteLocation).not.toHaveBeenCalled();
  });

  it("deletes the location and removes it from the list on confirm", async () => {
    deleteLocation.mockResolvedValue(undefined);
    render(<LocationsAdminPanel />);

    fireEvent.click(screen.getByText("deleteLocation"));
    const confirmButtons = screen.getAllByText("deleteLocation");
    fireEvent.click(confirmButtons[confirmButtons.length - 1]);

    await waitFor(() => expect(deleteLocation).toHaveBeenCalledWith("sande"));
    await waitFor(() => expect(useLocationsStore.getState().locations).toHaveLength(0));
  });
});
