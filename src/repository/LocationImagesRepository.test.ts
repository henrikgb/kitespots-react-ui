import { describe, expect, it } from "vitest";
import { toBlobKey } from "@/repository/LocationImagesRepository";

describe("toBlobKey", () => {
  it("strips the 'location-images/' container prefix, so the blob lands next to the other images instead of nested in a location-images subfolder", () => {
    expect(toBlobKey("location-images/sande.png")).toBe("sande.png");
  });

  it("leaves a blob name with no container prefix untouched", () => {
    expect(toBlobKey("sande.png")).toBe("sande.png");
  });

  it("only strips a leading container prefix, not one appearing elsewhere in the name", () => {
    expect(toBlobKey("archive/location-images/sande.png")).toBe("archive/location-images/sande.png");
  });
});
