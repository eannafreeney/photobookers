import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { eq } from "drizzle-orm";
import { getUser } from "../../../../utils";
import AuthModal from "../../../../components/app/AuthModal";
import Alert from "../../../../components/app/Alert";
import InfoPage from "../../../../pages/InfoPage";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import { isFeatureEnabledForUser } from "../../../../lib/features";
import { deleteUserFollow, insertUserFollow } from "../../../../db/queries";
import { db } from "../../../../db/client";
import { users } from "../../../../db/schema";
import { routeParam } from "../../../../lib/routeParam";
import { createCollectorFollowedNotification } from "../../../../domain/notifications/utils";
import CollectorFollowButton from "../../../../features/api/components/CollectorFollowButton";

const displayName = (u: {
  firstName: string | null;
  lastName: string | null;
}) => [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || "collector";

export const POST = createRoute(async (c: Context) => {
  const targetUserId = routeParam(c, "userId");
  const user = await getUser(c);

  if (!isFeatureEnabledForUser("collectors", user)) {
    return c.html(<InfoPage errorMessage="Not found" user={user} />, 404);
  }

  if (!user?.id) {
    return c.html(<AuthModal action="to follow this collector." />, 401);
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
      shelfSlug: true,
    },
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
  const message = isCurrentlyFollowing
    ? `No longer following ${name}.`
    : `Now following ${name}.`;

  return c.html(
    <>
      <Alert type="success" message={message} />
      <CollectorFollowButton targetUserId={targetUserId} user={user} />
    </>,
  );
});
