import { describe, expect, it } from "vitest";
import {
  HOMEPAGE_ACTIVITY_MIN_VIEWS,
  visibleHomepageActivityParts,
} from "./homepageActivityVisibility";

describe("visibleHomepageActivityParts", () => {
  it("hides parts below the minimum view threshold", () => {
    const below = HOMEPAGE_ACTIVITY_MIN_VIEWS - 1;
    expect(
      visibleHomepageActivityParts({ bookViews: below, profileViews: 100 }),
    ).toEqual({ showBooks: false, showProfiles: true });
    expect(
      visibleHomepageActivityParts({ bookViews: 100, profileViews: below }),
    ).toEqual({ showBooks: true, showProfiles: false });
    expect(
      visibleHomepageActivityParts({ bookViews: below, profileViews: below }),
    ).toEqual({ showBooks: false, showProfiles: false });
  });

  it("shows parts at the minimum view threshold", () => {
    expect(
      visibleHomepageActivityParts({
        bookViews: HOMEPAGE_ACTIVITY_MIN_VIEWS,
        profileViews: HOMEPAGE_ACTIVITY_MIN_VIEWS,
      }),
    ).toEqual({ showBooks: true, showProfiles: true });
  });
});
