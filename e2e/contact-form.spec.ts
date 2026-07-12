import { expect, test } from "@playwright/test";
import { e2eTargetBlockReason, hasE2eEnv } from "./helpers/env";

test.describe("contact form", () => {
  test.skip(!hasE2eEnv(), e2eTargetBlockReason() ?? "E2E not configured");

  test("submits successfully, shows toast, and clears fields", async ({
    page,
  }) => {
    await page.goto("/contact");

    await expect(
      page.getByRole("heading", { name: "Contact", exact: true }),
    ).toBeVisible();

    await page.getByPlaceholder("Your name").fill("E2E Contact User");
    await page.getByPlaceholder("you@example.com").fill("e2e-contact@example.com");
    await page
      .getByPlaceholder("How can we help?")
      .fill("Hello from the contact form end-to-end test.");

    // Anti-spam time check requires the form to be open for 3+ seconds.
    await page.waitForTimeout(3100);

    await page.getByRole("button", { name: "Send message" }).click();

    await expect(
      page.getByText("Message sent — we'll get back to you soon."),
    ).toBeVisible();

    await expect(page.getByPlaceholder("Your name")).toHaveValue("");
    await expect(page.getByPlaceholder("you@example.com")).toHaveValue("");
    await expect(page.getByPlaceholder("How can we help?")).toHaveValue("");
  });
});
