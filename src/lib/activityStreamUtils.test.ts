import { describe, expect, it } from "vitest";
import {
  formatSseMessage,
  isBroadcastableActivityEvent,
} from "./activityStreamUtils";

describe("isBroadcastableActivityEvent", () => {
  it("requires a non-empty image url", () => {
    expect(
      isBroadcastableActivityEvent({
        targetImageUrl: "https://cdn.example.com/cover.jpg",
      }),
    ).toBe(true);
    expect(isBroadcastableActivityEvent({ targetImageUrl: "  " })).toBe(false);
    expect(isBroadcastableActivityEvent({ targetImageUrl: null })).toBe(false);
  });
});

describe("formatSseMessage", () => {
  it("formats SSE frames", () => {
    expect(formatSseMessage("activity", '{"id":"1"}')).toBe(
      'event: activity\ndata: {"id":"1"}\n\n',
    );
  });
});
