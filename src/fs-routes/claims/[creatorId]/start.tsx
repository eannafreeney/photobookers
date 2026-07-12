import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../lib/validator";
import { claimFormSchema } from "../../../features/claims/schema";
import { creatorIdSchema } from "../../../schemas";
import { getFlash, getUser, setFlash } from "../../../utils";
import { getCreatorById } from "../../../features/dashboard/creators/services";
import { submitClaimForUser } from "../../../features/claims/actions";
import ClaimStartPage from "../../../features/claims/pages/ClaimStartPage";
import InfoPage from "../../../pages/InfoPage";
import { ProcessClaimContext } from "../../../features/claims/types";

const claimStartPath = (creatorId: string) => `/claims/${creatorId}/start`;

export const GET = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const creatorId = c.req.valid("param").creatorId;
  const user = await getUser(c);
  const flash = await getFlash(c);

  const [error, creator] = await getCreatorById(creatorId);
  if (error || !creator) {
    return c.html(
      <InfoPage errorMessage="Creator not found" user={user} />,
      404,
    );
  }

  if (creator.status !== "stub") {
    return c.html(
      <InfoPage
        errorMessage="This profile is not available to claim."
        user={user}
      />,
      403,
    );
  }

  return c.html(
    <ClaimStartPage
      creatorId={creatorId}
      creator={creator}
      user={user}
      flash={flash}
    />,
  );
});

export const POST = createRoute(
  paramValidator(creatorIdSchema),
  formValidator(claimFormSchema),
  async (c: ProcessClaimContext) => {
    const creatorId = c.req.valid("param").creatorId;
    const user = await getUser(c);
    const formData = c.req.valid("form");
    const startPath = claimStartPath(creatorId);

    if (!user) {
      await setFlash(c, "danger", "Please log in to submit a claim.");
      return c.redirect(startPath);
    }

    const result = await submitClaimForUser(user, creatorId, formData);

    if (result.type === "error") {
      await setFlash(c, "danger", result.message);
      return c.redirect(startPath);
    }

    if (result.type === "approved") {
      await setFlash(
        c,
        "success",
        "Your claim has been approved! Head to your dashboard to manage your profile.",
      );
      return c.redirect("/dashboard");
    }

    await setFlash(
      c,
      "info",
      "Your claim has been submitted for review. We'll notify you once it's approved.",
    );
    return c.redirect("/dashboard");
  },
);
