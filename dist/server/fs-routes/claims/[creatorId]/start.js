import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../lib/validator.js";
import { creatorIdSchema } from "../../../schemas/index.js";
import { getFlash, getUser, setFlash } from "../../../utils.js";
import { getCreatorById } from "../../../features/dashboard/creators/services.js";
import { submitClaimForUser } from "../../../features/claims/actions.js";
import ClaimStartPage from "../../../features/claims/pages/ClaimStartPage.js";
import InfoPage from "../../../pages/InfoPage.js";
const claimStartPath = (creatorId) => `/claims/${creatorId}/start`;
const GET = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const creatorId = c.req.valid("param").creatorId;
  const user = await getUser(c);
  const flash = await getFlash(c);
  const [error, creator] = await getCreatorById(creatorId);
  if (error || !creator) {
    return c.html(
      /* @__PURE__ */ jsx(InfoPage, { errorMessage: "Creator not found", user }),
      404
    );
  }
  if (creator.status !== "stub") {
    return c.html(
      /* @__PURE__ */ jsx(
        InfoPage,
        {
          errorMessage: "This profile is not available to claim.",
          user
        }
      ),
      403
    );
  }
  return c.html(
    /* @__PURE__ */ jsx(
      ClaimStartPage,
      {
        creatorId,
        creator,
        user,
        flash
      }
    )
  );
});
const POST = createRoute(
  paramValidator(creatorIdSchema),
  async (c) => {
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
        "Your claim has been approved! Head to your dashboard to manage your profile."
      );
      return c.redirect("/dashboard");
    }
    await setFlash(
      c,
      "info",
      "Your claim has been submitted for review. We'll notify you once it's approved."
    );
    return c.redirect("/dashboard");
  }
);
export {
  GET,
  POST
};
