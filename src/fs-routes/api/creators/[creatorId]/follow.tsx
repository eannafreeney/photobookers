import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils";
import AuthModal from "../../../../components/app/AuthModal";
import {
  getBookPermissionData,
  getCreatorPermissionData,
} from "../../../../features/api/services";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import {
  publishCollectActivity,
  publishFollowActivity,
} from "../../../../features/api/utils";
import {
  createBookCollectedNotification,
  createCreatorFollowedNotification,
} from "../../../../features/dashboard/admin/notifications/utils";
import Alert from "../../../../components/app/Alert";
import { dispatchEvents } from "../../../../lib/disatchEvents";
import {
  deleteCollectionItem,
  deleteFollow,
  insertCollectionItem,
  insertFollow,
} from "../../../../db/queries";
import CollectButton from "../../../../features/api/components/CollectButton";
import FollowButton from "../../../../features/api/components/FollowButton";

const updateLibraryPage = () => "library:updated";

export const POST = createRoute(async (c: Context) => {
  const creatorId = c.req.param("creatorId");
  const user = await getUser(c);
  const userId = user?.id;

  if (!userId)
    return c.html(<AuthModal action="to follow this creator." />, 401);

  const body = await c.req.parseBody();
  const isCurrentlyFollowing = body.isFollowing === "true";
  const isCircleButton = body.buttonType === "circle";

  const [err, creator] = await getCreatorPermissionData(creatorId);
  if (err || !creator)
    return showErrorAlert(c, err?.reason ?? "Creator not found");

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
      />
      <FollowButton
        creator={creator}
        user={user}
        isCircleButton={isCircleButton}
        variant="mobile"
      />
    </>,
  );
});
