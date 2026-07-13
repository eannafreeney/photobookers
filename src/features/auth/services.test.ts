import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/supabase", () => ({
  supabaseAdmin: {},
  supabaseAnon: {},
}));

const { updateMock, whereMock, setMock } = vi.hoisted(() => {
  const whereMock = vi.fn().mockResolvedValue(undefined);
  const setMock = vi.fn().mockReturnValue({ where: whereMock });
  const updateMock = vi.fn().mockReturnValue({ set: setMock });
  return { updateMock, whereMock, setMock };
});

vi.mock("../../db/client", () => ({
  db: {
    update: updateMock,
  },
}));

import { verifyCreatorsOwnedByUser } from "./services";

describe("verifyCreatorsOwnedByUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    whereMock.mockResolvedValue(undefined);
    setMock.mockReturnValue({ where: whereMock });
    updateMock.mockReturnValue({ set: setMock });
  });

  it("updates self-registered creators to verified", async () => {
    const [error] = await verifyCreatorsOwnedByUser("user-1");

    expect(error).toBeNull();
    expect(updateMock).toHaveBeenCalledOnce();
    expect(setMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: "verified" }),
    );
    expect(whereMock).toHaveBeenCalledOnce();
  });
});
