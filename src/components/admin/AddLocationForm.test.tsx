import React from "react";
import { afterEach, describe, expect, it, vi, beforeEach } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

vi.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key}:${JSON.stringify(options)}` : key,
  }),
}));

const { createLocation } = vi.hoisted(() => ({ createLocation: vi.fn() }));
vi.mock("@/util/axiosRequests/locationAdminApi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/util/axiosRequests/locationAdminApi")>();
  return { ...actual, createLocation };
});

import { AddLocationForm } from "@/components/admin/AddLocationForm";

describe("AddLocationForm", () => {
  beforeEach(() => {
    createLocation.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("blocks submission and shows a validation error when the name is empty", () => {
    render(<AddLocationForm />);

    fireEvent.click(screen.getByText("addLocation", { selector: "button" }));

    expect(screen.getByText("validationNameRequired")).toBeTruthy();
    expect(createLocation).not.toHaveBeenCalled();
  });

  it("blocks submission when no wind direction classification has been chosen", () => {
    render(<AddLocationForm />);

    fireEvent.change(screen.getByTestId("location-name-input"), { target: { value: "New Spot" } });
    fireEvent.change(screen.getByTestId("location-latitude-input"), { target: { value: "58.5" } });
    fireEvent.change(screen.getByTestId("location-longitude-input"), { target: { value: "5.6" } });
    fireEvent.click(screen.getByText("addLocation", { selector: "button" }));

    expect(screen.getByText("validationWindDirectionRequired")).toBeTruthy();
    expect(createLocation).not.toHaveBeenCalled();
  });
});
