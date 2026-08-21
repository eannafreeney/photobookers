import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { eq } from "drizzle-orm";
import { getUser } from "../../../../utils.js";
import AuthModal from "../../../../components/app/AuthModal.js";
import Alert from "../../../../components/app/Alert.js";
import { showErrorAlert } from "../../../../lib/alertHelpers.js";
import { deleteUserFollow, insertUserFollow } from "../../../../db/queries.js";
import { db } from "../../../../db/client.js";
import { users } from "../../../../db/schema.js";
import { routeParam } from "../../../../lib/routeParam.js";
import { createCollectorFollowedNotification } from "../../../../domain/notifications/utils.js";
import CollectorFollowButton from "../../../../features/api/components/CollectorFollowButton.js";
const displayName = (u) => [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || "collector";
const POST = createRoute(async (c) => {
  const targetUserId = routeParam(c, "userId");
  const user = await getUser(c);
  if (!user?.id) {
    return c.html(/* @__PURE__ */ jsx(AuthModal, { action: "to follow this collector." }), 401);
  }
  if (user.id === targetUserId) {
    return showErrorAlert(c, "You can't follow yourself.");
  }
  const target = await db.query.users.findFirst({
    where: eq(users.id, targetUserId),
    columns: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      shelfSlug: true
    }
  });
  if (!target) return showErrorAlert(c, "Collector not found");
  const body = await c.req.parseBody();
  const isCurrentlyFollowing = body.isFollowing === "true";
  try {
    if (isCurrentlyFollowing) {
      await deleteUserFollow(targetUserId, user.id);
    } else {
      await insertUserFollow(user.id, targetUserId);
      createCollectorFollowedNotification(user, target);
    }
  } catch (error) {
    console.error("Failed to follow/unfollow collector", error);
    return showErrorAlert(c);
  }
  const name = displayName(target);
  const message = isCurrentlyFollowing ? `No longer following ${name}.` : `Now following ${name}.`;
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Alert, { type: "success", message }),
      /* @__PURE__ */ jsx(CollectorFollowButton, { targetUserId, user })
    ] })
  );
});
export {
  POST
};
