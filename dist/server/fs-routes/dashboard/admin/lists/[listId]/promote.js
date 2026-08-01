import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../../../utils.js";
import { setListPromoted } from "../../../../../domain/lists/services.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
import Alert from "../../../../../components/app/Alert.js";
import ListPromoteToggleForm from "../../../../../features/dashboard/admin/lists/ListPromoteToggleForm.js";
import { routeParam } from "../../../../../lib/routeParam.js";
import { isListPromotionEligible } from "../../../../../domain/lists/utils.js";
import { db } from "../../../../../db/client.js";
import { bookLists } from "../../../../../db/schema.js";
import { eq } from "drizzle-orm";
const PATCH = createRoute(async (c) => {
  const user = await getUser(c);
  if (!user?.isAdmin) {
    return showErrorAlert(c, "Admin only");
  }
  const listId = routeParam(c, "listId");
  const body = await c.req.parseBody();
  const promoted = body.promoted === "true";
  const [err, updated] = await setListPromoted(listId, promoted);
  if (err || !updated) {
    return showErrorAlert(c, err?.reason ?? "Failed to update promotion");
  }
  const listWithOwner = await db.query.bookLists.findFirst({
    where: eq(bookLists.id, listId),
    with: {
      user: {
        columns: { shelfPublic: true, shelfSlug: true }
      }
    }
  });
  const canPromote = listWithOwner ? isListPromotionEligible(listWithOwner, listWithOwner.user) : false;
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        Alert,
        {
          type: "success",
          message: updated.isPromoted ? "List promoted." : "List removed from homepage."
        }
      ),
      /* @__PURE__ */ jsx(
        ListPromoteToggleForm,
        {
          listId: updated.id,
          isPromoted: updated.isPromoted,
          canPromote
        }
      )
    ] })
  );
});
export {
  PATCH
};
