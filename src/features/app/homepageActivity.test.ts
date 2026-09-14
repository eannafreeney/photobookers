import { describe, expect, it } from "vitest";
import {
  HOMEPAGE_ACTIVITY_MIN_VIEWS,
  visibleHomepageActivityParts,
} from "./homepageActivityVisibility";

const below = HOMEPAGE_ACTIVITY_MIN_VIEWS - 1;
const at = HOMEPAGE_ACTIVITY_MIN_VIEWS;

describe("visibleHomepageActivityParts", () => {
  it("hides parts below the minimum view threshold", () => {
    expect(
      visibleHomepageActivityParts({
        bookViews: below,
        profileViews: 100,
        buyClicks: below,
      }),
    ).toEqual({ showBooks: false, showProfiles: true, showClicks: false });
    expect(
      visibleHomepageActivityParts({
        bookViews: 100,
        profileViews: below,
        buyClicks: below,
      }),
    ).toEqual({ showBooks: true, showProfiles: false, showClicks: false });
    expect(
      visibleHomepageActivityParts({
        bookViews: below,
        profileViews: below,
        buyClicks: below,
      }),
    ).toEqual({ showBooks: false, showProfiles: false, showClicks: false });
  });

  it("shows parts at the minimum view threshold", () => {
    expect(
      visibleHomepageActivityParts({
        bookViews: at,
        profileViews: at,
        buyClicks: at,
      }),
    ).toEqual({ showBooks: true, showProfiles: true, showClicks: true });
  });
});
