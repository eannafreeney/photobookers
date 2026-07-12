import { expect, test } from "@playwright/test";
import { createE2eUser, deleteE2eAuthUsers, type E2eUser } from "./helpers/auth";
import { deleteTestData } from "./helpers/db";
import { e2eTargetBlockReason, hasE2eEnv } from "./helpers/env";
import { seedPublishedBook, seedStubCreator } from "./helpers/seed";

test.describe("global search", () => {
  test.skip(!hasE2eEnv(), e2eTargetBlockReason() ?? "E2E not configured");

  let seedUser: E2eUser;
  const trackedUserIds: string[] = [];
  const trackedCreatorIds: string[] = [];
  const trackedBookIds: string[] = [];

  test.beforeAll(async () => {
    seedUser = await createE2eUser({ emailDomain: "example.com" });
    trackedUserIds.push(seedUser.id);
  });

  test.afterAll(async () => {
    await deleteTestData({
      userIds: trackedUserIds,
      creatorIds: trackedCreatorIds,
      bookIds: trackedBookIds,
    });
    await deleteE2eAuthUsers(trackedUserIds);
  });

  test("search results page finds a seeded published book", async ({ page }) => {
    const artist = await seedStubCreator({
      createdByUserId: seedUser.id,
      displayName: "E2E Search Artist",
    });
    trackedCreatorIds.push(artist.id);

    const uniqueTitle = `E2E Searchfolio ${Date.now()}`;
    const book = await seedPublishedBook({
      createdByUserId: seedUser.id,
      artistId: artist.id,
      title: uniqueTitle,
    });
    trackedBookIds.push(book.id);

    await page.goto(`/search/results?search=${encodeURIComponent(uniqueTitle)}`);

    await expect(
      page.getByRole("heading", {
        name: new RegExp(`Results for.*${uniqueTitle}`),
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: new RegExp(uniqueTitle) }).first(),
    ).toHaveAttribute("href", `/books/${book.slug}`);
  });
});
