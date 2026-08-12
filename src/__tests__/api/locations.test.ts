import { describe, expect, it, vi, beforeEach } from "vitest";
import type { NextApiRequest, NextApiResponse } from "next";

const { getLocations } = vi.hoisted(() => ({ getLocations: vi.fn() }));
vi.mock("@/service/LocationsService", () => ({ getLocations }));

import handler from "@/pages/api/locations";

const createMockRes = () => {
  const res: Partial<NextApiResponse> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as NextApiResponse & { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> };
};

describe("GET /api/locations", () => {
  beforeEach(() => {
    getLocations.mockReset();
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
