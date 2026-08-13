import { describe, expect, it } from "vitest";
import {
  generateLocationId,
  isDuplicateLocationName,
  isValidLocationId,
  validateImageUpload,
  validateNewLocationInput,
  validateWindDirectionDescriptions,
  MAX_IMAGE_SIZE_BYTES,
} from "@/domain/locationValidation";

const validWindRows = [{ intervalStart: 0, intervalStop: 180, category: "offshore" }];

describe("validateNewLocationInput", () => {
  it("accepts a fully valid submission and derives colorCode from the canonical mapping", () => {
    const result = validateNewLocationInput({
      name: "  New Spot  ",
      latitude: 58.5,
      longitude: 5.6,
      windDirectionDescriptions: validWindRows,
    });

    expect(result.valid).toBe(true);
    expect(result.data?.name).toBe("New Spot");
    expect(result.data?.windDirectionDescriptions[0].colorCode).toBe("#FD0100");
    expect(result.data?.beginnerScore).toBe(0);
  });

  it("rejects a missing name", () => {
    const result = validateNewLocationInput({
      name: "",
      latitude: 58.5,
      longitude: 5.6,
      windDirectionDescriptions: validWindRows,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Name is required.");
  });

  it("rejects latitude out of range", () => {
    const result = validateNewLocationInput({
      name: "Spot",
      latitude: 91,
      longitude: 5.6,
      windDirectionDescriptions: validWindRows,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("Latitude"))).toBe(true);
  });

  it("rejects longitude out of range", () => {
    const result = validateNewLocationInput({
      name: "Spot",
      latitude: 58.5,
      longitude: -181,
      windDirectionDescriptions: validWindRows,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("Longitude"))).toBe(true);
  });

  it("rejects a score outside 0-5", () => {
    const result = validateNewLocationInput({
      name: "Spot",
      latitude: 58.5,
      longitude: 5.6,
      beginnerScore: 6,
      windDirectionDescriptions: validWindRows,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("Beginner score"))).toBe(true);
  });

  it("rejects an empty wind direction list", () => {
    const result = validateNewLocationInput({
      name: "Spot",
      latitude: 58.5,
      longitude: 5.6,
      windDirectionDescriptions: [],
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("At least one wind direction classification is required.");
  });
});

describe("validateWindDirectionDescriptions", () => {
  it("rejects an unknown category", () => {
    const { errors } = validateWindDirectionDescriptions([
      { intervalStart: 0, intervalStop: 10, category: "sideways" },
    ]);

    expect(errors.some((e) => e.includes("not a valid wind direction classification"))).toBe(true);
  });

  it("rejects intervalStart >= intervalStop", () => {
    const { errors } = validateWindDirectionDescriptions([
      { intervalStart: 100, intervalStop: 50, category: "offshore" },
    ]);

    expect(errors.some((e) => e.includes("start degree must be less than end degree"))).toBe(true);
  });

  it("rejects degrees outside 0-360", () => {
    const { errors } = validateWindDirectionDescriptions([
      { intervalStart: -5, intervalStop: 370, category: "offshore" },
    ]);

    expect(errors.length).toBeGreaterThan(0);
  });

  it("never trusts a caller-supplied colorCode - always derives it from the category", () => {
    const { data } = validateWindDirectionDescriptions([
      { intervalStart: 0, intervalStop: 10, category: "onshore", colorCode: "#000000" },
    ]);

    expect(data[0].colorCode).toBe("#008000");
  });
});

describe("validateImageUpload", () => {
  it("accepts an allowed type within the size limit", () => {
    expect(validateImageUpload("image/png", 1024)).toEqual([]);
  });

  it("rejects a disallowed MIME type", () => {
    const errors = validateImageUpload("application/pdf", 1024);
    expect(errors.some((e) => e.includes("not supported"))).toBe(true);
  });

  it("rejects a file over the maximum size", () => {
    const errors = validateImageUpload("image/png", MAX_IMAGE_SIZE_BYTES + 1);
    expect(errors.some((e) => e.includes("smaller"))).toBe(true);
  });

  it("rejects an empty file", () => {
    const errors = validateImageUpload("image/png", 0);
    expect(errors.some((e) => e.includes("empty"))).toBe(true);
  });
});

describe("generateLocationId", () => {
  it("slugifies a name to match the existing lowercase-no-separator convention", () => {
    expect(generateLocationId("San Juan Playa", [])).toBe("sanjuanplaya");
    expect(generateLocationId("Sande", [])).toBe("sande");
  });

  it("appends a numeric suffix on a case-insensitive collision", () => {
    expect(generateLocationId("Sele", ["sele"])).toBe("sele-2");
    expect(generateLocationId("SELE", ["sele", "sele-2"])).toBe("sele-3");
  });

  it("never returns an empty id even for a name with no alphanumeric characters", () => {
    expect(generateLocationId("!!!", [])).toBe("location");
  });
});

describe("isDuplicateLocationName", () => {
  it("is case-insensitive and trims whitespace", () => {
    expect(isDuplicateLocationName("  Sande ", ["sande"])).toBe(true);
    expect(isDuplicateLocationName("Sola", ["sande"])).toBe(false);
  });
});

describe("isValidLocationId", () => {
  it("accepts ids that look like what generateLocationId produces", () => {
    expect(isValidLocationId("sande")).toBe(true);
    expect(isValidLocationId("sanjuanplaya")).toBe(true);
    expect(isValidLocationId("sele-2")).toBe(true);
    expect(isValidLocationId("location")).toBe(true);
  });

  it("rejects ids that could escape the location-images/ blob prefix (path traversal / injection)", () => {
    expect(isValidLocationId("../../etc/passwd")).toBe(false);
    expect(isValidLocationId("..")).toBe(false);
    expect(isValidLocationId("foo/bar")).toBe(false);
    expect(isValidLocationId("foo\\bar")).toBe(false);
  });

  it("rejects empty, whitespace, and otherwise malformed ids", () => {
    expect(isValidLocationId("")).toBe(false);
    expect(isValidLocationId(" sande")).toBe(false);
    expect(isValidLocationId("sande ")).toBe(false);
    expect(isValidLocationId("Sande")).toBe(false);
    expect(isValidLocationId("sande--2")).toBe(false);
    expect(isValidLocationId("-sande")).toBe(false);
    expect(isValidLocationId("sande-")).toBe(false);
  });
});
