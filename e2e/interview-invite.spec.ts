import { expect, test } from "@playwright/test";
import { createE2eUser, deleteE2eAuthUsers, type E2eUser } from "./helpers/auth";
import { deleteTestData } from "./helpers/db";
import { e2eTargetBlockReason, hasE2eEnv } from "./helpers/env";
import { seedInterviewInvite, seedVerifiedCreator } from "./helpers/seed";

test.describe("interview invite", () => {
  test.skip(!hasE2eEnv(), e2eTargetBlockReason() ?? "E2E not configured");

  let seedUser: E2eUser;
  const trackedUserIds: string[] = [];
  const trackedCreatorIds: string[] = [];
  const trackedInterviewIds: string[] = [];

  test.beforeAll(async () => {
    seedUser = await createE2eUser({ emailDomain: "example.com" });
    trackedUserIds.push(seedUser.id);
  });

  test.afterAll(async () => {
    await deleteTestData({
      userIds: trackedUserIds,
      creatorIds: trackedCreatorIds,
      interviewIds: trackedInterviewIds,
    });
    await deleteE2eAuthUsers(trackedUserIds);
  });

  test("sent interview token renders the introduction form", async ({ page }) => {
    const displayName = `E2E Interview Artist ${Date.now()}`;
    const creator = await seedVerifiedCreator({
      ownerUserId: seedUser.id,
      createdByUserId: seedUser.id,
      displayName,
    });
    trackedCreatorIds.push(creator.id);

    const invite = await seedInterviewInvite({
      creatorId: creator.id,
      creatorSlug: creator.slug,
      invitedByUserId: seedUser.id,
    });
    trackedInterviewIds.push(invite.id);

    await page.goto(`/interviews/${invite.inviteToken}`);

    await expect(
      page.getByRole("heading", { name: `Hi ${displayName},` }),
    ).toBeVisible();
    await expect(page.locator("#interview-form")).toBeVisible();
    await expect(page.locator("#interview-form button")).toContainText(
      "Submit interview",
    );
  });
});
