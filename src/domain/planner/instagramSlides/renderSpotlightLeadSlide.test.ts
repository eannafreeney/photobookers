import { describe, expect, it } from "vitest";
import {
  buildBookCreditsSubtitle,
  buildSpotlightLeadOverlaySvg,
  type SpotlightLeadLabel,
} from "./renderSpotlightLeadSlide";

const labels: SpotlightLeadLabel[] = [
  "Book of the Day",
  "Artist of the Week",
  "Publisher of the Week",
  "New on photobookers",
];

describe("coverLayoutForSpotlightLabel", () => {
  it("uses square mats for creators and a wide mat for books", async () => {
    const { coverLayoutForSpotlightLabel } = await import(
      "./renderSpotlightLeadSlide"
    );
    const artist = coverLayoutForSpotlightLabel("Artist of the Week");
    const creator = coverLayoutForSpotlightLabel("New on photobookers");
    const publisher = coverLayoutForSpotlightLabel("Publisher of the Week");
    const book = coverLayoutForSpotlightLabel("Book of the Day");

    expect(artist.width).toBe(artist.height);
    expect(creator.width).toBe(creator.height);
    expect(publisher.width).toBe(publisher.height);
    expect(book.width).toBeGreaterThan(book.height);
    expect(book.width).toBeGreaterThan(artist.width);
  });
});

describe("buildSpotlightLeadOverlaySvg", () => {
  it.each(labels)("renders %s with footer", (label) => {
    const svg = buildSpotlightLeadOverlaySvg(label);
    expect(svg).toContain(label);
    expect(svg).toContain("PHOTOBOOKERS.COM");
    expect(svg).toContain('font-family="Fraunces"');
  });

  it("renders creator name between cover area and footer", () => {
    const svg = buildSpotlightLeadOverlaySvg("Artist of the Week", {
      title: "Jane Doe",
    });
    expect(svg).toContain("Jane Doe");
    expect(svg).toContain('y="950"');
    expect(svg).toContain('y="1048"');
  });

  it("renders book title and credits like trending books", () => {
    const svg = buildSpotlightLeadOverlaySvg("Book of the Day", {
      title: "Winter Light",
      subtitle: "Jane Doe · Acme Press",
    });
    expect(svg).toContain("Winter Light");
    expect(svg).toContain("Jane Doe · Acme Press");
    expect(svg).toContain('y="930"');
    expect(svg).toContain('y="972"');
  });

  it("does not render a top banner bar", () => {
    const svg = buildSpotlightLeadOverlaySvg("Book of the Day");
    expect(svg).not.toContain('height="96"');
  });
});

describe("buildBookCreditsSubtitle", () => {
  it("joins artist and publisher with a middle dot", () => {
    expect(
      buildBookCreditsSubtitle({
        artist: { displayName: "Jane Doe" },
        publisher: { displayName: "Acme Press" },
      }),
    ).toBe("Jane Doe · Acme Press");
  });
});
