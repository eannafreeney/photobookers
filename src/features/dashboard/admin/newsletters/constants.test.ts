import { afterEach, describe, expect, it } from "vitest";
import { newsletterNavLinks, resolveAppBaseUrl } from "./constants";

describe("resolveAppBaseUrl", () => {
  const prevPublic = process.env.PUBLIC_APP_URL;
  const prevSite = process.env.SITE_URL;

  afterEach(() => {
    if (prevPublic === undefined) delete process.env.PUBLIC_APP_URL;
    else process.env.PUBLIC_APP_URL = prevPublic;
    if (prevSite === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = prevSite;
  });

  it("falls through empty PUBLIC_APP_URL to SITE_URL (GH Actions empty secret)", () => {
    process.env.PUBLIC_APP_URL = "";
    process.env.SITE_URL = "https://www.photobookers.com";

    expect(resolveAppBaseUrl()).toBe("https://www.photobookers.com");
    expect(newsletterNavLinks()[0]?.href).toBe(
      "https://www.photobookers.com/",
    );
  });
});
