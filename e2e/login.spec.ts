import { expect, test } from "@playwright/test";
import { createE2eUser, deleteE2eAuthUsers, type E2eUser } from "./helpers/auth";
import { deleteTestData } from "./helpers/db";
import { e2eTargetBlockReason, hasE2eEnv } from "./helpers/env";

test.describe("login", () => {
  test.skip(!hasE2eEnv(), e2eTargetBlockReason() ?? "E2E not configured");

  const trackedUserIds: string[] = [];

  test.afterAll(async () => {
    await deleteTestData({ userIds: trackedUserIds });
    await deleteE2eAuthUsers(trackedUserIds);
  });

  test("password sign-in redirects to shelf", async ({ page }) => {
    const user = await createE2eUser({ emailDomain: "example.com" });
    trackedUserIds.push(user.id);

    await page.goto("/auth/login?redirectUrl=/shelf");

    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
    await page.getByPlaceholder("you@example.com").fill(user.email);
    await page.getByPlaceholder("••••••••").fill(user.password);
    await page.getByRole("button", { name: "Log In" }).click();

    await expect(page).toHaveURL(/\/shelf$/);
    await expect(
      page.getByRole("heading", { name: "Shelf", level: 1 }),
    ).toBeVisible();
  });
});
