import { describe, expect, it, vi, beforeEach } from "vitest";
import type { NextApiRequest, NextApiResponse } from "next";

const { getLocations, createLocation } = vi.hoisted(() => ({
  getLocations: vi.fn(),
  createLocation: vi.fn(),
}));
const { requireSession } = vi.hoisted(() => ({ requireSession: vi.fn() }));

vi.mock("@/service/LocationsService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/service/LocationsService")>();
  return { ...actual, getLocations, createLocation };
});
vi.mock("@/util/auth/requireSession", () => ({ requireSession }));

import handler from "@/pages/api/locations";

const createMockRes = () => {
  const res: Partial<NextApiResponse> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.setHeader = vi.fn().mockReturnValue(res);
  return res as NextApiResponse & {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
    setHeader: ReturnType<typeof vi.fn>;
  };
};

describe("GET /api/locations", () => {
  beforeEach(() => {
    getLocations.mockReset();
    createLocation.mockReset();
    requireSession.mockReset();
  });

  it("responds 200 with the location list on success", async () => {
    const locations = [{ id: "sele", name: "Sele" }];
    getLocations.mockResolvedValue(locations);
    const res = createMockRes();

    await handler({} as NextApiRequest, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: locations });
  });

  it("responds 200 with an empty array when there are zero locations", async () => {
    getLocations.mockResolvedValue([]);
    const res = createMockRes();

    await handler({} as NextApiRequest, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: [] });
  });

  it("responds 500 with an error payload when the service throws", async () => {
    getLocations.mockRejectedValue(new Error("blob storage unavailable"));
    const res = createMockRes();

    await handler({} as NextApiRequest, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
  });
});

describe("POST /api/locations", () => {
  beforeEach(() => {
    getLocations.mockReset();
    createLocation.mockReset();
    requireSession.mockReset();
  });

  it("rejects an anonymous request with 401 and never calls the service", async () => {
    requireSession.mockResolvedValue(null); // requireSession already wrote the 401 itself
    const res = createMockRes();

    await handler({ method: "POST", body: { name: "New Spot" } } as NextApiRequest, res);

    expect(createLocation).not.toHaveBeenCalled();
  });

  it("creates a location for an authenticated request and responds 201", async () => {
    requireSession.mockResolvedValue({ user: { name: "Admin" } });
    const created = { id: "newspot", name: "New Spot" };
    createLocation.mockResolvedValue(created);
    const res = createMockRes();

    await handler({ method: "POST", body: { name: "New Spot" } } as NextApiRequest, res);

    expect(createLocation).toHaveBeenCalledWith({ name: "New Spot" });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ data: created });
  });

  it("maps a LocationServiceError to its statusCode and error list", async () => {
    requireSession.mockResolvedValue({ user: { name: "Admin" } });
    const { LocationServiceError } = await import("@/service/LocationsService");
    createLocation.mockRejectedValue(new LocationServiceError("Invalid location input.", 400, ["Name is required."]));
    const res = createMockRes();

    await handler({ method: "POST", body: {} } as NextApiRequest, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid location input.", errors: ["Name is required."] });
  });

  it("responds 405 for unsupported methods", async () => {
    const res = createMockRes();

    await handler({ method: "PATCH" } as NextApiRequest, res);

    expect(res.status).toHaveBeenCalledWith(405);
  });
});
