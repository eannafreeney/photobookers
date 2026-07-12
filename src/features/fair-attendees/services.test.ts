import { describe, expect, it, vi, beforeEach } from "vitest";

const { findFirstFairMock, findFirstAttendeeMock, insertMock, deleteMock } =
  vi.hoisted(() => ({
    findFirstFairMock: vi.fn(),
    findFirstAttendeeMock: vi.fn(),
    insertMock: vi.fn(),
    deleteMock: vi.fn(),
  }));

vi.mock("../../db/client", () => ({
  db: {
    query: {
      bookFairs: { findFirst: findFirstFairMock },
      fairAttendees: { findFirst: findFirstAttendeeMock },
    },
    insert: insertMock,
    delete: deleteMock,
  },
}));

import {
  isFairOpenForAttendance,
  requestFairAttendance,
  withdrawFairAttendance,
} from "./services";

const futureDate = new Date(Date.now() + 86_400_000);
const pastDate = new Date(Date.now() - 86_400_000);

const openFair = {
  id: "fair-1",
  status: "published",
  approvalStatus: "approved",
  endDate: futureDate,
};

describe("isFairOpenForAttendance", () => {
  it("returns true only for published approved fairs that have not ended", () => {
    expect(isFairOpenForAttendance(openFair)).toBe(true);
    expect(
      isFairOpenForAttendance({ ...openFair, status: "draft" }),
    ).toBe(false);
    expect(
      isFairOpenForAttendance({ ...openFair, endDate: pastDate }),
    ).toBe(false);
  });
});

describe("requestFairAttendance", () => {
  beforeEach(() => {
    findFirstFairMock.mockReset();
    findFirstAttendeeMock.mockReset();
    insertMock.mockReset();
  });

  it("rejects closed fairs", async () => {
    findFirstFairMock.mockResolvedValue({
      ...openFair,
      endDate: pastDate,
    });

    const result = await requestFairAttendance("fair-1", "creator-1");

    expect(result[0]?.reason).toBe(
      "This fair is no longer accepting attendance claims",
    );
  });

  it("rejects duplicate attendance", async () => {
    findFirstFairMock.mockResolvedValue(openFair);
    findFirstAttendeeMock.mockResolvedValue({
      id: "attendee-1",
      status: "approved",
    });

    const result = await requestFairAttendance("fair-1", "creator-1");

    expect(result[0]?.reason).toBe("You are already attending this fair");
  });

  it("allows re-request after rejection", async () => {
    findFirstFairMock.mockResolvedValue(openFair);
    findFirstAttendeeMock.mockResolvedValue({
      id: "attendee-1",
      status: "rejected",
    });
    deleteMock.mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    });
    insertMock.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi
          .fn()
          .mockResolvedValue([{ id: "attendee-2", fairId: "fair-1" }]),
      }),
    });

    const result = await requestFairAttendance("fair-1", "creator-1");

    expect(result[1]?.id).toBe("attendee-2");
    expect(deleteMock).toHaveBeenCalled();
  });
});

describe("withdrawFairAttendance", () => {
  beforeEach(() => {
    findFirstFairMock.mockReset();
    deleteMock.mockReset();
  });

  it("rejects withdrawal after fair ends", async () => {
    findFirstFairMock.mockResolvedValue({
      ...openFair,
      endDate: pastDate,
    });

    const result = await withdrawFairAttendance("fair-1", "creator-1");

    expect(result[0]?.reason).toBe("This fair has ended");
  });

  it("deletes an existing attendance record", async () => {
    findFirstFairMock.mockResolvedValue(openFair);
    deleteMock.mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi
          .fn()
          .mockResolvedValue([{ id: "attendee-1", fairId: "fair-1" }]),
      }),
    });

    const result = await withdrawFairAttendance("fair-1", "creator-1");

    expect(result[1]?.id).toBe("attendee-1");
  });
});
