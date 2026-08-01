import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { getUser } from "../../../../../utils";
import { setListPromoted } from "../../../../../domain/lists/services";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import Alert from "../../../../../components/app/Alert";
import ListPromoteToggleForm from "../../../../../features/dashboard/admin/lists/ListPromoteToggleForm";
import { routeParam } from "../../../../../lib/routeParam";
import { isListPromotionEligible } from "../../../../../domain/lists/utils";
import { db } from "../../../../../db/client";
import { bookLists } from "../../../../../db/schema";
import { eq } from "drizzle-orm";

export const PATCH = createRoute(async (c: Context) => {
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

  // Re-check eligibility for the toggle (owner shelf may be private).
  const listWithOwner = await db.query.bookLists.findFirst({
    where: eq(bookLists.id, listId),
    with: {
      user: {
        columns: { shelfPublic: true, shelfSlug: true },
      },
    },
  });
  const canPromote = listWithOwner
    ? isListPromotionEligible(listWithOwner, listWithOwner.user)
    : false;

  return c.html(
    <>
      <Alert
        type="success"
        message={updated.isPromoted ? "List promoted." : "List removed from homepage."}
      />
      <ListPromoteToggleForm
        listId={updated.id}
        isPromoted={updated.isPromoted}
        canPromote={canPromote}
      />
    </>,
  );
});
