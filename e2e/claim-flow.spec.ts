import { expect, test } from "@playwright/test";
import {
  createE2eUser,
  deleteE2eAuthUsers,
  signInAndSetCookies,
  type E2eUser,
} from "./helpers/auth";
import {
  deleteTestData,
  getClaimForUserAndCreator,
  getCreatorById,
} from "./helpers/db";
import { e2eBaseUrl, e2eTargetBlockReason, hasE2eEnv } from "./helpers/env";
import { seedStubCreator } from "./helpers/seed";

test.describe("claim flow", () => {
  test.skip(!hasE2eEnv(), e2eTargetBlockReason() ?? "E2E not configured");

  let seedUser: E2eUser;
  const trackedUserIds: string[] = [];
  const trackedCreatorIds: string[] = [];

  test.beforeAll(async () => {
    seedUser = await createE2eUser({ emailDomain: "example.com" });
    trackedUserIds.push(seedUser.id);
  });

  test.afterAll(async () => {
    await deleteTestData({
      userIds: trackedUserIds,
      creatorIds: trackedCreatorIds,
    });
    await deleteE2eAuthUsers(trackedUserIds);
  });

  test("logged-out visitor sees the signup form", async ({ page }) => {
    const creator = await seedStubCreator({
      createdByUserId: seedUser.id,
      website: "https://example.com",
    });
    trackedCreatorIds.push(creator.id);

    await page.goto(`/claims/${creator.id}/start`);

    await expect(
      page.getByRole("heading", { name: /claim this creator profile/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /create account & submit claim/i }),
    ).toBeVisible();
    await expect(page.getByText(/already have an account/i)).toBeVisible();
  });

  test("logged-out visitor without listed website sees website input", async ({
    page,
  }) => {
    const creator = await seedStubCreator({
      createdByUserId: seedUser.id,
      website: null,
    });
    trackedCreatorIds.push(creator.id);

    await page.goto(`/claims/${creator.id}/start`);

    await expect(page.getByPlaceholder("https://yourwebsite.com")).toBeVisible();
  });

  test("logged-in user with tampered verification URL is rejected", async ({
    page,
    context,
  }) => {
    const creator = await seedStubCreator({
      createdByUserId: seedUser.id,
      website: "https://example.com",
    });
    trackedCreatorIds.push(creator.id);

    const claimant = await createE2eUser({ emailDomain: "example.com" });
    trackedUserIds.push(claimant.id);

    await signInAndSetCookies(context, claimant, e2eBaseUrl());
    await page.goto(`/claims/${creator.id}/start`);

    await page.locator('input[name="form.verificationUrl"]').evaluate(
      (input) => {
        (input as HTMLInputElement).value = "https://other.com";
      },
    );
    await page.getByRole("button", { name: /submit claim/i }).click();

    await expect(page).toHaveURL(/\/claims\/.*\/start/);
    await expect(
      page.getByText(/must match the creator's listed website/i),
    ).toBeVisible();

    const claim = await getClaimForUserAndCreator(claimant.id, creator.id);
    expect(claim).toBeUndefined();
  });

  test("verified creator profile cannot be claimed", async ({ page }) => {
    const creator = await seedStubCreator({
      createdByUserId: seedUser.id,
      website: "https://example.com",
    });
    trackedCreatorIds.push(creator.id);

    const { creators } = await import("../src/db/schema");
    const { eq } = await import("drizzle-orm");
    const { getE2eDb } = await import("./helpers/db");

    await getE2eDb()
      .update(creators)
      .set({
        status: "verified",
        ownerUserId: seedUser.id,
        verifiedAt: new Date(),
      })
      .where(eq(creators.id, creator.id));

    const response = await page.goto(`/claims/${creator.id}/start`);
    expect(response?.status()).toBe(403);
    await expect(page.getByText(/not available to claim/i)).toBeVisible();
  });

  test("logged-in user with matching email domain is auto-approved", async ({
    page,
    context,
  }) => {
    const creator = await seedStubCreator({
      createdByUserId: seedUser.id,
      website: "https://example.com",
    });
    trackedCreatorIds.push(creator.id);

    const claimant = await createE2eUser({ emailDomain: "example.com" });
    trackedUserIds.push(claimant.id);

    await signInAndSetCookies(context, claimant, e2eBaseUrl());
    await page.goto(`/claims/${creator.id}/start`);

    await expect(
      page.getByRole("heading", { name: /claim creator profile/i }),
    ).toBeVisible();
    await page.getByRole("button", { name: /submit claim/i }).click();

    await expect(page).toHaveURL(/\/dashboard/);

    const updatedCreator = await getCreatorById(creator.id);
    expect(updatedCreator?.status).toBe("verified");
    expect(updatedCreator?.ownerUserId).toBe(claimant.id);

    const claim = await getClaimForUserAndCreator(claimant.id, creator.id);
    expect(claim?.status).toBe("approved");
  });

  test("logged-in user with non-matching email domain goes to pending review", async ({
    page,
    context,
  }) => {
    const creator = await seedStubCreator({
      createdByUserId: seedUser.id,
      website: "https://example.com",
    });
    trackedCreatorIds.push(creator.id);

    const claimant = await createE2eUser({ emailDomain: "gmail.com" });
    trackedUserIds.push(claimant.id);

    await signInAndSetCookies(context, claimant, e2eBaseUrl());
    await page.goto(`/claims/${creator.id}/start`);
    await page.getByRole("button", { name: /submit claim/i }).click();

    await expect(page).toHaveURL(/\/dashboard/);

    const updatedCreator = await getCreatorById(creator.id);
    expect(updatedCreator?.status).toBe("stub");
    expect(updatedCreator?.ownerUserId).toBeNull();

    const claim = await getClaimForUserAndCreator(claimant.id, creator.id);
    expect(claim?.status).toBe("pending_admin_review");
  });

  test("admin can approve a pending claim", async ({ page, context }) => {
    const creator = await seedStubCreator({
      createdByUserId: seedUser.id,
      website: "https://example.com",
    });
    trackedCreatorIds.push(creator.id);

    const claimant = await createE2eUser({ emailDomain: "gmail.com" });
    trackedUserIds.push(claimant.id);

    const admin = await createE2eUser({ emailDomain: "photobookers.com" });
    trackedUserIds.push(admin.id);
    const { setUserAdmin } = await import("./helpers/auth");
    await setUserAdmin(admin.id, true);

    await signInAndSetCookies(context, claimant, e2eBaseUrl());
    await page.goto(`/claims/${creator.id}/start`);
    await page.getByRole("button", { name: /submit claim/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    const pendingClaim = await getClaimForUserAndCreator(
      claimant.id,
      creator.id,
    );
    expect(pendingClaim?.status).toBe("pending_admin_review");

    await context.clearCookies();
    await signInAndSetCookies(context, admin, e2eBaseUrl());

    const approveResponse = await page.request.post(
      `/dashboard/admin/claims/${pendingClaim!.id}/approve`,
    );
    expect(approveResponse.ok()).toBe(true);

    const updatedCreator = await getCreatorById(creator.id);
    expect(updatedCreator?.status).toBe("verified");
    expect(updatedCreator?.ownerUserId).toBe(claimant.id);

    const approvedClaim = await getClaimForUserAndCreator(
      claimant.id,
      creator.id,
    );
    expect(approvedClaim?.status).toBe("approved");
  });
});
