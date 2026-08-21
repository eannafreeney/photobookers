import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils.js";
import InfoPage from "../../../../pages/InfoPage.js";
import ShelfSharingPanel from "../../../../features/app/components/ShelfSharingPanel.js";
import {
  suggestShelfSlug,
  updateShelfSharing
} from "../../../../domain/shelf/services.js";
import { userCanHaveShelf } from "../../../../domain/shelf/utils.js";
import Alert from "../../../../components/app/Alert.js";
const POST = createRoute(async (c) => {
  const user = await getUser(c);
  if (!user) {
    return c.html(/* @__PURE__ */ jsx(Alert, { type: "danger", message: "Sign in to update your shelf." }), 401);
  }
  if (!userCanHaveShelf(user)) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Not found", user }), 404);
  }
  const body = await c.req.parseBody();
  const shelfPublic = body.shelfPublic === "true";
  const shelfSlug = typeof body.shelfSlug === "string" ? body.shelfSlug : void 0;
  const [error, updated] = await updateShelfSharing(user.id, {
    shelfPublic,
    shelfSlug
  });
  if (error || !updated) {
    const suggestedSlug2 = await suggestShelfSlug(user.id);
    return c.html(
      /* @__PURE__ */ jsx(
        ShelfSharingPanel,
        {
          user: {
            ...user,
            shelfSlug: user.shelfSlug,
            shelfPublic: user.shelfPublic
          },
          suggestedSlug: suggestedSlug2,
          message: error?.reason ?? "Failed to update shelf sharing"
        }
      ),
      400
    );
  }
  const suggestedSlug = await suggestShelfSlug(user.id);
  const message = updated.shelfPublic ? "Your shelf is now public." : "Your shelf is now private.";
  return c.html(
    /* @__PURE__ */ jsx(
      ShelfSharingPanel,
      {
        user: {
          ...user,
          shelfSlug: updated.shelfSlug,
          shelfPublic: updated.shelfPublic
        },
        suggestedSlug,
        message
      }
    )
  );
});
export {
  POST
};
