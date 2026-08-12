import { describe, expect, it, vi, beforeEach } from "vitest";
import type { NextApiRequest, NextApiResponse } from "next";

const { deleteLocation } = vi.hoisted(() => ({ deleteLocation: vi.fn() }));
const { requireSession } = vi.hoisted(() => ({ requireSession: vi.fn() }));

vi.mock("@/service/LocationsService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/service/LocationsService")>();
  return { ...actual, deleteLocation };
});
vi.mock("@/util/auth/requireSession", () => ({ requireSession }));

import handler from "@/pages/api/locations/[id]";

const createMockRes = () => {
  const res: Partial<NextApiResponse> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.end = vi.fn().mockReturnValue(res);
  res.setHeader = vi.fn().mockReturnValue(res);
  return res as NextApiResponse & {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
    end: ReturnType<typeof vi.fn>;
    setHeader: ReturnType<typeof vi.fn>;
  };
};

describe("DELETE /api/locations/[id]", () => {
  beforeEach(() => {
    deleteLocation.mockReset();
    requireSession.mockReset();
  });

  it("rejects an anonymous request with 401 and never calls the service", async () => {
    requireSession.mockResolvedValue(null);
    const res = createMockRes();

    await handler({ method: "DELETE", query: { id: "sande" } } as unknown as NextApiRequest, res);

    expect(deleteLocation).not.toHaveBeenCalled();
  });

  it("deletes the location for an authenticated request and responds 204", async () => {
    requireSession.mockResolvedValue({ user: { name: "Admin" } });
    deleteLocation.mockResolvedValue(undefined);
    const res = createMockRes();

    await handler({ method: "DELETE", query: { id: "sande" } } as unknown as NextApiRequest, res);

    expect(deleteLocation).toHaveBeenCalledWith("sande");
    expect(res.status).toHaveBeenCalledWith(204);
  });

  it("responds 404 when the service reports the location doesn't exist", async () => {
    requireSession.mockResolvedValue({ user: { name: "Admin" } });
    const { LocationServiceError } = await import("@/service/LocationsService");
    deleteLocation.mockRejectedValue(new LocationServiceError('No location with id "x" exists.', 404));
    const res = createMockRes();

    await handler({ method: "DELETE", query: { id: "x" } } as unknown as NextApiRequest, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("responds 405 for unsupported methods", async () => {
    const res = createMockRes();

    await handler({ method: "GET", query: { id: "sande" } } as unknown as NextApiRequest, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(deleteLocation).not.toHaveBeenCalled();
  });
});
