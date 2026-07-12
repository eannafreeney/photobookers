import { expect, test } from "@playwright/test";
import {
  createE2eUser,
  deleteE2eAuthUsers,
  signInAndSetCookies,
  type E2eUser,
} from "./helpers/auth";
import { deleteTestData, hasWishlistEntry } from "./helpers/db";
import { e2eBaseUrl, e2eTargetBlockReason, hasE2eEnv } from "./helpers/env";
import {
  seedPublishedBook,
  seedStubCreator,
  seedVerifiedCreator,
} from "./helpers/seed";

test.describe("book social actions", () => {
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

  test("logged-out visitor sees auth modal when favoriting a book", async ({
    page,
  }) => {
    const artist = await seedStubCreator({
      createdByUserId: seedUser.id,
    });
    trackedCreatorIds.push(artist.id);

    const book = await seedPublishedBook({
      createdByUserId: seedUser.id,
      artistId: artist.id,
    });
    trackedBookIds.push(book.id);

    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(`/books/${book.slug}`);

    await expect(
      page.getByRole("heading", { name: book.title, level: 1 }),
    ).toBeVisible();

    await page.locator(`#favorite-${book.id} button`).click();

    await expect(
      page.getByRole("heading", {
        name: /please login or register to favorite this book/i,
      }),
    ).toBeVisible();
  });

  test("logged-in fan can favorite and unfavorite a book", async ({
    page,
    context,
  }) => {
    const fan = await createE2eUser({ emailDomain: "example.com" });
    trackedUserIds.push(fan.id);

    const artist = await seedStubCreator({
      createdByUserId: seedUser.id,
    });
    trackedCreatorIds.push(artist.id);

    const book = await seedPublishedBook({
      createdByUserId: seedUser.id,
      artistId: artist.id,
    });
    trackedBookIds.push(book.id);

    await signInAndSetCookies(context, fan, e2eBaseUrl());
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(`/books/${book.slug}`);

    const favoriteForm = page.locator(`#favorite-${book.id}`);

    await favoriteForm.locator("button").click();
    await expect(page.getByText(`${book.title} favorited`)).toBeVisible();
    await expect(favoriteForm.getByText("Favorited")).toBeVisible();
    expect(await hasWishlistEntry(fan.id, book.id)).toBe(true);

    await favoriteForm.locator("button").click();
    await expect(page.getByText(`${book.title} unfavorited`)).toBeVisible();
    expect(await hasWishlistEntry(fan.id, book.id)).toBe(false);
  });

  test("creator cannot favorite their own book", async ({ page, context }) => {
    const creatorUser = await createE2eUser({ emailDomain: "example.com" });
    trackedUserIds.push(creatorUser.id);

    const artist = await seedVerifiedCreator({
      ownerUserId: creatorUser.id,
      createdByUserId: seedUser.id,
    });
    trackedCreatorIds.push(artist.id);

    const book = await seedPublishedBook({
      createdByUserId: creatorUser.id,
      artistId: artist.id,
    });
    trackedBookIds.push(book.id);

    await signInAndSetCookies(context, creatorUser, e2eBaseUrl());
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(`/books/${book.slug}`);

    await expect(page.locator(`#favorite-${book.id} button`)).toBeDisabled();
  });
});
