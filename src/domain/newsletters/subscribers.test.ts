import { describe, expect, it } from "vitest";
import {
  NEWSLETTER_SUBSCRIBER_MIN_DISPLAY,
  newsletterSubscriberLabel,
} from "./subscribers";

describe("newsletterSubscriberLabel", () => {
  it("stays quiet when there is nothing to boast about", () => {
    expect(newsletterSubscriberLabel(null)).toBeNull();
    expect(newsletterSubscriberLabel(0)).toBeNull();
    expect(
      newsletterSubscriberLabel(NEWSLETTER_SUBSCRIBER_MIN_DISPLAY - 1),
    ).toBeNull();
  });

  it("rounds down to a stable figure", () => {
    expect(newsletterSubscriberLabel(87)).toBe("Join 80+ readers");
    expect(newsletterSubscriberLabel(1204)).toBe("Join 1,200+ readers");
    expect(newsletterSubscriberLabel(1999)).toBe("Join 1,900+ readers");
  });

  it("shows the threshold itself", () => {
    expect(
      newsletterSubscriberLabel(NEWSLETTER_SUBSCRIBER_MIN_DISPLAY),
    ).toBe("Join 50+ readers");
  });
});
