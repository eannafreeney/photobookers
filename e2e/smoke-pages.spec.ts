import { expect, test } from "@playwright/test";
import { createE2eUser, deleteE2eAuthUsers, type E2eUser } from "./helpers/auth";
import { deleteTestData } from "./helpers/db";
import { e2eTargetBlockReason, hasE2eEnv } from "./helpers/env";
import {
  seedPublishedBook,
  seedPublishedFair,
  seedVerifiedCreator,
} from "./helpers/seed";

test.describe("public page smoke", () => {
  test.skip(!hasE2eEnv(), e2eTargetBlockReason() ?? "E2E not configured");

  let seedUser: E2eUser;
  const trackedUserIds: string[] = [];
  const trackedCreatorIds: string[] = [];
  const trackedBookIds: string[] = [];
  const trackedFairIds: string[] = [];

  test.beforeAll(async () => {
    seedUser = await createE2eUser({ emailDomain: "example.com" });
    trackedUserIds.push(seedUser.id);
  });

  test.afterAll(async () => {
    await deleteTestData({
      userIds: trackedUserIds,
      creatorIds: trackedCreatorIds,
      bookIds: trackedBookIds,
      fairIds: trackedFairIds,
    });
    await deleteE2eAuthUsers(trackedUserIds);
  });

  test("/featured renders the homepage hero", async ({ page }) => {
    await page.goto("/featured");

    await expect(
      page.getByRole("heading", {
        name: /every photobook, artist, and publisher/i,
      }),
    ).toBeVisible();
  });

  test("/creators/[slug] renders a seeded verified creator", async ({ page }) => {
    const displayName = `E2E Creator Smoke ${Date.now()}`;
    const creator = await seedVerifiedCreator({
      ownerUserId: seedUser.id,
      createdByUserId: seedUser.id,
      displayName,
    });
    trackedCreatorIds.push(creator.id);

    const book = await seedPublishedBook({
      createdByUserId: seedUser.id,
      artistId: creator.id,
    });
    trackedBookIds.push(book.id);

    await page.goto(`/creators/${creator.slug}`);

    await expect(
      page.getByRole("heading", { name: displayName, level: 1 }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: book.title }).first()).toBeVisible();
  });

  test("/fairs/[slug] renders a seeded published fair", async ({ page }) => {
    const fair = await seedPublishedFair({
      createdByUserId: seedUser.id,
      name: `E2E Fair Smoke ${Date.now()}`,
    });
    trackedFairIds.push(fair.id);

    await page.goto(`/fairs/${fair.slug}`);

    await expect(
      page.getByRole("heading", { name: fair.name, level: 1 }),
    ).toBeVisible();
  });
});
