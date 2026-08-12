import { describe, expect, it } from "vitest";
import {
  findWindConditionForDirection,
  getWindConditionId,
  getWindConditionLabel,
  WIND_CONDITIONS,
} from "@/domain/windCondition";

describe("windCondition canonical mapping", () => {
  it("maps every category to its exact internal id and label", () => {
    expect(WIND_CONDITIONS.sideOnshore.id).toBe("side-onshore-ideal");
    expect(WIND_CONDITIONS.sideOnshore.label).toBe("Side onshore - ideal");
    expect(WIND_CONDITIONS.onshore.id).toBe("onshore-hard-for-beginners");
    expect(WIND_CONDITIONS.onshore.label).toBe("Onshore - hard for beginners");
    expect(WIND_CONDITIONS.overLand.id).toBe("over-land-gusty");
    expect(WIND_CONDITIONS.overLand.label).toBe("Over land - gusty");
    expect(WIND_CONDITIONS.sideOffshore.id).toBe("side-offshore-dangerous");
    expect(WIND_CONDITIONS.sideOffshore.label).toBe("Side offshore - dangerous");
    expect(WIND_CONDITIONS.offshore.id).toBe("offshore-very-dangerous");
    expect(WIND_CONDITIONS.offshore.label).toBe("Offshore - very dangerous");
  });

  it("getWindConditionId/getWindConditionLabel resolve known categories", () => {
    expect(getWindConditionId("offshore")).toBe("offshore-very-dangerous");
    expect(getWindConditionLabel("offshore")).toBe("Offshore - very dangerous");
  });

  it("falls back gracefully for an unknown category instead of throwing", () => {
    expect(getWindConditionId("unknownCategory")).toBeUndefined();
    expect(getWindConditionLabel("unknownCategory")).toBe("unknownCategory");
  });

  describe("findWindConditionForDirection", () => {
    const descriptions = [
      { intervalStart: 0, intervalStop: 100, category: "offshore", colorCode: "#FD0100" },
      { intervalStart: 100, intervalStop: 360, category: "onshore", colorCode: "#008000" },
    ];

    it("finds the condition whose interval contains the direction", () => {
      expect(findWindConditionForDirection(50, descriptions)?.id).toBe("offshore-very-dangerous");
      expect(findWindConditionForDirection(200, descriptions)?.id).toBe("onshore-hard-for-beginners");
    });

    it("returns the location-specific colorCode for the matched interval", () => {
      expect(findWindConditionForDirection(50, descriptions)?.colorCode).toBe("#FD0100");
    });

    it("returns undefined when no interval contains the direction", () => {
      expect(findWindConditionForDirection(-1, descriptions)).toBeUndefined();
    });

    it("returns undefined for an interval whose category is not one of the 5 known categories", () => {
      const unknown = [{ intervalStart: 0, intervalStop: 360, category: "sideways", colorCode: "#000" }];
      expect(findWindConditionForDirection(10, unknown)).toBeUndefined();
    });
  });
});
