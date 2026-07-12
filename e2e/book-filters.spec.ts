import { expect, test } from "@playwright/test";
import { createE2eUser, deleteE2eAuthUsers, type E2eUser } from "./helpers/auth";
import { deleteTestData } from "./helpers/db";
import { e2eTargetBlockReason, hasE2eEnv } from "./helpers/env";
import { seedPublishedBook, seedStubCreator } from "./helpers/seed";

test.describe("book filters", () => {
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

  test("search and tag filters refresh the catalog via AJAX", async ({
    page,
  }) => {
    const artist = await seedStubCreator({
      createdByUserId: seedUser.id,
      displayName: "E2E Filter Artist",
    });
    trackedCreatorIds.push(artist.id);

    const uniqueTitle = `E2E Zincfolio ${Date.now()}`;
    const book = await seedPublishedBook({
      createdByUserId: seedUser.id,
      artistId: artist.id,
      title: uniqueTitle,
      tags: ["urban"],
    });
    trackedBookIds.push(book.id);

    await page.goto("/books");

    const searchInput = page.getByPlaceholder(
      "Search by title, artist, publisher, or tag…",
    );
    await searchInput.fill(uniqueTitle);

    await expect(page).toHaveURL(/q=E2E(\+|%20)Zincfolio(\+|%20)/);
    await expect(
      page.getByRole("link", { name: uniqueTitle }).first(),
    ).toBeVisible();

    await page.getByRole("button", { name: "Urban", exact: true }).click();

    await expect(page).toHaveURL(/[?&]tag=urban/);
    await expect(
      page.getByRole("link", { name: uniqueTitle }).first(),
    ).toBeVisible();
    await expect(searchInput).toHaveValue("");
  });
});
