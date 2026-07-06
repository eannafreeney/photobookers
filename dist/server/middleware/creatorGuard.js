import { jsx } from "hono/jsx/jsx-runtime";
import { createMiddleware } from "hono/factory";
import { getUser } from "../utils.js";
import { canEditCreator } from "../lib/permissions.js";
import { getCreatorById } from "../features/dashboard/creators/services.js";
import InfoPage from "../pages/InfoPage.js";
const requireCreatorEditAccess = createMiddleware(
  async (c, next) => {
    const user = await getUser(c);
    const creatorId = c.req.param("creatorId");
    if (!creatorId) {
      return c.html(
        /* @__PURE__ */ jsx(InfoPage, { errorMessage: "Creator ID is required", user }),
        400
      );
    }
    const [error, creator] = await getCreatorById(creatorId);
    if (error || !creator) {
      return c.html(
        /* @__PURE__ */ jsx(InfoPage, { errorMessage: "Creator not found", user }),
        404
      );
    }
    if (!creator) {
      return c.html(
        /* @__PURE__ */ jsx(InfoPage, { errorMessage: "Creator not found", user }),
        404
      );
    }
    if (!canEditCreator(user, creator)) {
      if (user?.creator?.status !== "verified") {
        const notYetVerifiedErrorMessage = "Your creator profile is pending verification. You can upload and edit books, but profile editing is only available after your profile is approved.";
        return c.html(
          /* @__PURE__ */ jsx(InfoPage, { errorMessage: notYetVerifiedErrorMessage, user }),
          403
        );
      }
      return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Unauthorized", user }), 403);
    }
    c.set("creator", creator);
    await next();
  }
);
export {
  requireCreatorEditAccess
};
