import { describe, expect, it } from "vitest";
import {
  canTransitionReviewRequest,
  isBookCreator,
  requestStatusAfterReview,
  reviewBylineHref,
  showsReviewCopyLabel,
} from "./policy";

describe("review request transitions", () => {
  it("lets a creator approve or decline a new request", () => {
    expect(canTransitionReviewRequest("requested", "approved")).toBe(true);
    expect(canTransitionReviewRequest("requested", "declined")).toBe(true);
    expect(canTransitionReviewRequest("requested", "sent")).toBe(false);
  });

  it("lets a sent copy become reviewed", () => {
    expect(canTransitionReviewRequest("sent", "reviewed")).toBe(true);
    expect(canTransitionReviewRequest("declined", "approved")).toBe(false);
  });
});

describe("review authorship", () => {
  it("blocks the book's artist or publisher", () => {
    expect(
      isBookCreator("artist-owner", {
        artistOwnerUserId: "artist-owner",
        publisherOwnerUserId: "pub-owner",
      }),
    ).toBe(true);
    expect(
      isBookCreator("reader", {
        artistOwnerUserId: "artist-owner",
        publisherOwnerUserId: "pub-owner",
      }),
    ).toBe(false);
  });

  it("prefers the reviewer page, then a public shelf", () => {
    expect(
      reviewBylineHref({
        reviewerSlug: "ada",
        shelfSlug: "ada-shelf",
        shelfPublic: true,
      }),
    ).toBe("/reviewers/ada");
    expect(
      reviewBylineHref({ shelfSlug: "ada-shelf", shelfPublic: true }),
    ).toBe("/shelf/ada-shelf");
    expect(reviewBylineHref({ shelfSlug: "ada-shelf", shelfPublic: false })).toBe(
      null,
    );
  });

  it("marks a review copy only after the request is reviewed", () => {
    expect(showsReviewCopyLabel("reviewed")).toBe(true);
    expect(showsReviewCopyLabel("sent")).toBe(false);
    expect(requestStatusAfterReview("sent")).toBe("reviewed");
    expect(requestStatusAfterReview("requested")).toBe(null);
  });
});
