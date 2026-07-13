import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../../lib/supabase", () => ({
  supabaseAdmin: {},
  supabaseAnon: {},
}));

vi.mock("../notifications/utils", () => ({
  createNewPublisherNotification: vi.fn(),
}));

vi.mock("../../creators/services", () => ({
  getCreatorById: vi.fn(),
}));

const { updateMock, returningMock, whereMock, setMock } = vi.hoisted(() => {
  const returningMock = vi.fn();
  const whereMock = vi.fn().mockReturnValue({ returning: returningMock });
  const setMock = vi.fn().mockReturnValue({ where: whereMock });
  const updateMock = vi.fn().mockReturnValue({ set: setMock });
  return { updateMock, returningMock, whereMock, setMock };
});

vi.mock("../../../../db/client", () => ({
  db: {
    update: updateMock,
  },
}));

vi.mock("../../../app/services", () => ({
  invalidateCreatorCache: vi.fn(),
}));

import { verifyCreatorAdmin } from "./services";

describe("verifyCreatorAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    whereMock.mockReturnValue({ returning: returningMock });
    setMock.mockReturnValue({ where: whereMock });
    updateMock.mockReturnValue({ set: setMock });
  });

  it("verifies a stub creator", async () => {
    returningMock.mockResolvedValue([
      { id: "creator-1", displayName: "Jane", slug: "jane", status: "verified" },
    ]);

    const [error, creator] = await verifyCreatorAdmin("creator-1");

    expect(error).toBeNull();
    expect(creator?.status).toBe("verified");
    expect(setMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: "verified" }),
    );
  });

  it("returns error when creator is already verified", async () => {
    returningMock.mockResolvedValue([]);

    const [error] = await verifyCreatorAdmin("creator-1");

    expect(error?.reason).toBe("Creator not found or already verified");
  });
});
