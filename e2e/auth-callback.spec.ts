import { expect, test } from "@playwright/test";
import {
  createE2eSignupCallback,
  deleteE2eAuthUsers,
} from "./helpers/auth";
import { deleteTestData } from "./helpers/db";
import { e2eTargetBlockReason, hasE2eEnv } from "./helpers/env";

test.describe("auth callback", () => {
  test.skip(!hasE2eEnv(), e2eTargetBlockReason() ?? "E2E not configured");

  const trackedUserIds: string[] = [];

  test.afterAll(async () => {
    await deleteTestData({ userIds: trackedUserIds });
    await deleteE2eAuthUsers(trackedUserIds);
  });

  test("fan email verification callback creates account and lands on homepage", async ({
    page,
  }) => {
    const signup = await createE2eSignupCallback({
      firstName: "E2E",
      lastName: "Verified",
    });
    trackedUserIds.push(signup.userId);

    await page.goto(signup.callbackPath);

    await expect(page).toHaveURL(/\/featured$/);
    await expect(page.getByRole("link", { name: "Library" })).toBeVisible();
  });
});
