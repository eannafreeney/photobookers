import { describe, expect, it } from "vitest";
import { resolveBookSubmitterContact } from "./resolveBookSubmitterContact";

describe("resolveBookSubmitterContact", () => {
  it("greets the uploader when falling back to their email", () => {
    const contact = resolveBookSubmitterContact({
      artist: { displayName: "Famous Artist", email: null },
      publisher: null,
      notifyFollowersCreatorId: "artist-1",
      artistId: "artist-1",
      creatorUser: {
        email: "contributor@example.com",
        firstName: "Sam",
        lastName: "Contributor",
      },
    });

    expect(contact).toEqual({
      recipientEmail: "contributor@example.com",
      displayName: "Sam Contributor",
    });
  });

  it("uses the artist profile name when emailing the artist profile", () => {
    const contact = resolveBookSubmitterContact({
      artist: { displayName: "Famous Artist", email: "artist@example.com" },
      publisher: null,
      notifyFollowersCreatorId: "artist-1",
      artistId: "artist-1",
      creatorUser: {
        email: "contributor@example.com",
        firstName: "Sam",
        lastName: "Contributor",
      },
    });

    expect(contact).toEqual({
      recipientEmail: "artist@example.com",
      displayName: "Famous Artist",
    });
  });
});
