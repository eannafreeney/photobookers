import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils";
import AuthModal from "../../../../components/app/AuthModal";
import { getCreatorPermissionData } from "../../../../features/api/services";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import { publishFollowActivity } from "../../../../features/api/utils";
import { createCreatorFollowedNotification } from "../../../../features/dashboard/admin/notifications/utils";
import Alert from "../../../../components/app/Alert";
import { deleteFollow, insertFollow } from "../../../../db/queries";
import FollowButton from "../../../../features/api/components/FollowButton";
import { dispatchEvents } from "../../../../lib/disatchEvents";
import { hyperview } from "../../../../lib/hxml";
import { getIsHyperview } from "../../../../features/hyperview/lib";
import { getBaseUrl } from "../../../../lib/hyperview";
import { Behavior, Text, View } from "../../../../lib/hxml-comps";

export const POST = createRoute(async (c: Context) => {
  const isHyperview = getIsHyperview(c);
  return isHyperview ? postFollowHyperview(c) : postFollowWeb(c);
});

const postFollowHyperview = async (c: Context) => {
  const creatorId = c.req.param("creatorId");
  const user = await getUser(c);
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const userId = user?.id;

  if (!userId) {
    const modalHref = `${baseUrl}/hyperview/auth-modal?action=${encodeURIComponent("to follow this creator.")}`;
    return hv(
      <View xmlns="https://hyperview.org/hyperview">
        <Behavior trigger="load" action="new" verb="get" href={modalHref} />
        <Text style="follow-label">Follow</Text>
        <Behavior trigger="press" verb="get" action="new" href={modalHref} />
      </View>,
      401,
    );
  }

  const body = await c.req.parseBody();
  const isCurrentlyFollowing = body.isFollowing === "true";

  const [err, creator] = await getCreatorPermissionData(creatorId);
  if (err || !creator) {
    return hv(
      <text xmlns="https://hyperview.org/hyperview" style="follow-label">
        Creator not found
      </text>,
    );
  }

  try {
    if (isCurrentlyFollowing) {
      await deleteFollow(creatorId, userId);
    } else {
      await insertFollow(userId, creatorId);
      publishFollowActivity(user, creator);
      createCreatorFollowedNotification(user, creator);
    }
  } catch (error) {
    console.error("Failed to add/remove creator from followers", error);
    hv(
      <text xmlns="https://hyperview.org/hyperview" style="follow-label">
        Something went wrong
      </text>,
    );
  }

  const label = isCurrentlyFollowing
    ? `Follow ${creator.displayName}`
    : `Following ✓`;
  return hv(
    <text xmlns="https://hyperview.org/hyperview" style="follow-label">
      {label}
    </text>,
  );
};

const postFollowWeb = async (c: Context) => {
  const creatorId = c.req.param("creatorId");
  const user = await getUser(c);
  const userId = user?.id;

  if (!userId) {
    return c.html(<AuthModal action="to follow this creator." />, 401);
  }

  const body = await c.req.parseBody();
  const isCurrentlyFollowing = body.isFollowing === "true";
  const isCircleButton = body.buttonType === "circle";
  const shouldRefreshCreatorMessages =
    body.shouldRefreshCreatorMessages === "true";

  const [err, creator] = await getCreatorPermissionData(creatorId);
  if (err || !creator) {
    return showErrorAlert(c, err?.reason ?? "Creator not found");
  }

  try {
    if (isCurrentlyFollowing) {
      await deleteFollow(creatorId, userId);
    } else {
      await insertFollow(userId, creatorId);
      publishFollowActivity(user, creator);
      createCreatorFollowedNotification(user, creator);
    }
  } catch (error) {
    console.error("Failed to add/remove creator from followers", error);
    return showErrorAlert(c);
  }

  const message = isCurrentlyFollowing
    ? `No longer following ${creator.displayName}.`
    : `Now following ${creator.displayName}.`;

  return c.html(
    <>
      <Alert type="success" message={message} />
      <FollowButton
        creator={creator}
        user={user}
        isCircleButton={isCircleButton}
        shouldRefreshCreatorMessages={shouldRefreshCreatorMessages}
      />
      <FollowButton
        creator={creator}
        user={user}
        isCircleButton={isCircleButton}
        variant="mobile"
        shouldRefreshCreatorMessages={shouldRefreshCreatorMessages}
      />
      {shouldRefreshCreatorMessages &&
        dispatchEvents(["creator-messages:updated"])}
    </>,
  );
};
