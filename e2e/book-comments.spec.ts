import { expect, test } from "@playwright/test";
import {
  createE2eUser,
  deleteE2eAuthUsers,
  signInAndSetCookies,
  type E2eUser,
} from "./helpers/auth";
import { deleteTestData } from "./helpers/db";
import { e2eBaseUrl, e2eTargetBlockReason, hasE2eEnv } from "./helpers/env";
import { seedPublishedBook, seedStubCreator } from "./helpers/seed";

const uniqueComment = () => `E2E comment ${Date.now()}`;

test.describe("book comments", () => {
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

  test("logged-out visitor sees login prompt in comment modal", async ({
    page,
  }) => {
    const artist = await seedStubCreator({ createdByUserId: seedUser.id });
    trackedCreatorIds.push(artist.id);

    const book = await seedPublishedBook({
      createdByUserId: seedUser.id,
      artistId: artist.id,
    });
    trackedBookIds.push(book.id);

    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(`/books/${book.slug}`);

    const commentsResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/comments") &&
        response.request().method() === "GET",
    );
    await page.locator('#comments-list a[href*="/comments"]').click();
    await commentsResponse;

    await expect(
      page.getByRole("heading", {
        name: /please login or register to comment on this book/i,
      }),
    ).toBeVisible();
  });

  test("logged-in fan with avatar can post a comment", async ({
    page,
    context,
  }) => {
    const fan = await createE2eUser({
      emailDomain: "example.com",
      profileImageUrl: "https://example.com/e2e-avatar.jpg",
    });
    trackedUserIds.push(fan.id);

    const artist = await seedStubCreator({ createdByUserId: seedUser.id });
    trackedCreatorIds.push(artist.id);

    const book = await seedPublishedBook({
      createdByUserId: seedUser.id,
      artistId: artist.id,
    });
    trackedBookIds.push(book.id);

    const body = uniqueComment();

    await signInAndSetCookies(context, fan, e2eBaseUrl());
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(`/books/${book.slug}`);

    await page
      .locator("#comments-list")
      .getByRole("button", { name: "Add Comment" })
      .click();

    await page.locator('textarea[name="body"]').fill(body);
    await page.getByRole("button", { name: "Add Comment" }).click();

    await expect(page.getByText("Comment added successfully")).toBeVisible();
    await expect(
      page.locator("#comments-list").getByText(body, { exact: true }),
    ).toBeVisible();
  });
});
