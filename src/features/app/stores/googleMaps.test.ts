import { describe, expect, it } from "vitest";
import { buildGoogleMapsUrl } from "./googleMaps";

describe("buildGoogleMapsUrl", () => {
  it("builds a Google Maps search URL with name and address", () => {
    const url = buildGoogleMapsUrl(
      "Dashwood Books",
      "33 Bond St, New York, NY 10012",
    );

    expect(url).toBe(
      "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent("Dashwood Books, 33 Bond St, New York, NY 10012"),
    );
  });
});
