import path from "node:path";
import { expect, test } from "@playwright/test";
import {
  createE2eUser,
  deleteE2eAuthUsers,
  signInAndSetCookies,
  type E2eUser,
} from "./helpers/auth";
import { deleteTestData } from "./helpers/db";
import { e2eBaseUrl, e2eTargetBlockReason, hasE2eEnv } from "./helpers/env";
import { seedVerifiedCreator } from "./helpers/seed";

const importFixture = path.join(
  import.meta.dirname,
  "fixtures/import-one-book.csv",
);

test.describe("book CSV import", () => {
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

  test("verified creator can preview and confirm a one-row CSV import", async ({
    page,
    context,
  }) => {
    const creatorUser = await createE2eUser({ emailDomain: "example.com" });
    trackedUserIds.push(creatorUser.id);

    const artist = await seedVerifiedCreator({
      ownerUserId: creatorUser.id,
      createdByUserId: seedUser.id,
    });
    trackedCreatorIds.push(artist.id);

    await signInAndSetCookies(context, creatorUser, e2eBaseUrl());
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/dashboard/books/import");

    await page.locator('input[name="csv"]').setInputFiles(importFixture);
    await page.getByRole("button", { name: "Preview import" }).click();

    await expect(page.locator("#import-preview")).toBeVisible();
    await expect(page.getByText(/1 valid row/)).toBeVisible();
    await page.getByRole("button", { name: /confirm import/i }).click();

    await expect(
      page.getByRole("heading", { name: "Import complete" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "E2E Import Photobook" })).toBeVisible();

    const importedBookLink = page.getByRole("link", {
      name: "E2E Import Photobook",
    });
    const href = await importedBookLink.getAttribute("href");
    const bookId = href?.match(/\/dashboard\/books\/([^/]+)/)?.[1];
    if (bookId) trackedBookIds.push(bookId);
  });
});
