import { describe, expect, it } from "vitest";
import { isAllowedLocationImagePath } from "@/repository/LocationImageRepository";

describe("isAllowedLocationImagePath", () => {
  it("allows paths under the location-images/ prefix", () => {
    expect(isAllowedLocationImagePath("location-images/sande.png")).toBe(true);
  });

  it("rejects paths outside the location-images/ prefix, e.g. other blobs in the container", () => {
    expect(isAllowedLocationImagePath("locations.json")).toBe(false);
    expect(isAllowedLocationImagePath("weather/sele.json")).toBe(false);
  });

  it("rejects path traversal attempts", () => {
    expect(isAllowedLocationImagePath("location-images/../locations.json")).toBe(false);
  });
});
