import { expect, test } from "@playwright/test";
import {
  createE2eUser,
  deleteE2eAuthUsers,
  signInAndSetCookies,
  type E2eUser,
} from "./helpers/auth";
import { deleteTestData, getBookPublicationStatus } from "./helpers/db";
import { e2eBaseUrl, e2eTargetBlockReason, hasE2eEnv } from "./helpers/env";
import { seedDraftApprovedBook, seedVerifiedCreator } from "./helpers/seed";

test.describe("creator book publish", () => {
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

  test("verified creator can publish a draft approved book from the dashboard", async ({
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

    const book = await seedDraftApprovedBook({
      createdByUserId: creatorUser.id,
      artistId: artist.id,
    });
    trackedBookIds.push(book.id);

    await signInAndSetCookies(context, creatorUser, e2eBaseUrl());
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/dashboard");

    await expect(page.getByRole("link", { name: book.title })).toBeVisible();

    const publishToggle = page.locator(`#publish-toggle-${book.id}`);
    await publishToggle.locator("label").click();

    await expect(page.getByText(`${book.title} Published!`)).toBeVisible();
    expect(await getBookPublicationStatus(book.id)).toBe("published");

    await page.goto(`/books/${book.slug}`);
    await expect(
      page.getByRole("heading", { name: book.title, level: 1 }),
    ).toBeVisible();
  });
});
