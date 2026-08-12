import React from "react";
import { afterEach, describe, expect, it, vi, beforeEach } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { BeachInfo } from "@/components/layouts/BeachInfo";
import { useLocationsStore } from "@/store/locationsStore";
import { useWeatherDataStore } from "@/store/weatherDataStore";
import { KiteSpotLocation } from "@/types/model/Location";

vi.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { changeLanguage: vi.fn() } }),
}));
vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: { alt: string; src: string; onError?: () => void }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={props.alt} src={props.src} onError={props.onError} />
  ),
}));

// A location that is not one of the previous nine hardcoded beaches, to confirm nothing
// depends on the old fixed list.
const dynamicLocation: KiteSpotLocation = {
  id: "brand-new-spot",
  name: "Brand New Spot",
  latitude: 58.5,
  longitude: 5.6,
  imageUrl: "/api/locationImage/location-images/brand-new-spot.png",
  beginnerScore: 4,
  freestyleScore: 2,
  waveScore: 3,
  windDirectionDescriptions: [],
};

describe("BeachInfo", () => {
  beforeEach(() => {
    useLocationsStore.setState({ locations: [dynamicLocation], isLocationsLoading: false, locationsError: null });
    useWeatherDataStore.setState({ selectedLocation: "brand-new-spot" });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders a dynamically loaded location that isn't one of the old hardcoded nine", () => {
    render(<BeachInfo />);

    expect(screen.getByAltText("Brand New Spot")).toBeTruthy();
    expect(screen.getAllByText("side-onshore-ideal").length).toBeGreaterThan(0);
  });

  it("shows a loading state while locations are still loading", () => {
    useLocationsStore.setState({ isLocationsLoading: true });

    render(<BeachInfo />);

    expect(screen.getByTestId("loader")).toBeTruthy();
  });

  it("shows an error state instead of crashing when locations failed to load", () => {
    useLocationsStore.setState({ isLocationsLoading: false, locationsError: "boom" });

    render(<BeachInfo />);

    expect(screen.getByText("failedToLoadLocations")).toBeTruthy();
  });

  it("shows a graceful fallback instead of crashing when there is no selected location (e.g. zero locations)", () => {
    useLocationsStore.setState({ locations: [], isLocationsLoading: false, locationsError: null });
    useWeatherDataStore.setState({ selectedLocation: undefined });

    render(<BeachInfo />);

    expect(screen.getByText("noKiteSpotsAvailable")).toBeTruthy();
  });

  it("falls back to a placeholder instead of crashing when the location image fails to load", () => {
    render(<BeachInfo />);

    const image = screen.getByAltText("Brand New Spot");
    fireEvent.error(image);

    expect(screen.getByText("imageNotAvailableYet")).toBeTruthy();
  });
});
