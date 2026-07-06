import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils.js";
import AuthModal from "../../../../components/app/AuthModal.js";
import {
  getCreatorPermissionData,
  findFollow
} from "../../../../features/api/services.js";
import { showErrorAlert } from "../../../../lib/alertHelpers.js";
import { publishFollowActivity } from "../../../../features/api/utils.js";
import { createCreatorFollowedNotification } from "../../../../domain/notifications/utils.js";
import Alert from "../../../../components/app/Alert.js";
import { deleteFollow, insertFollow } from "../../../../db/queries.js";
import { dispatchEvents } from "../../../../lib/disatchEvents.js";
import { hyperview } from "../../../../lib/hxml.js";
import { getIsHyperview } from "../../../../features/hyperview/lib.js";
import { getBaseUrl } from "../../../../lib/hyperview.js";
import { Behavior, Text, View } from "../../../../lib/hxml-comps.js";
import { HyperviewFollowInner } from "../../../../features/hyperview/components/FollowButton.js";
import FollowButton from "../../../../features/api/components/FollowButton.js";
import { routeParam } from "../../../../lib/routeParam.js";
const POST = createRoute(async (c) => {
  const isHyperview = getIsHyperview(c);
  return isHyperview ? postFollowHyperview(c) : postFollowWeb(c);
});
const postFollowHyperview = async (c) => {
  const creatorId = routeParam(c, "creatorId");
  const user = await getUser(c);
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const userId = user?.id;
  if (!userId) {
    const modalHref = `${baseUrl}/hyperview/auth-modal?action=${encodeURIComponent("to follow this creator.")}`;
    return hv(
      /* @__PURE__ */ jsxs(View, { xmlns: "https://hyperview.org/hyperview", children: [
        /* @__PURE__ */ jsx(Behavior, { trigger: "load", action: "new", verb: "get", href: modalHref }),
        /* @__PURE__ */ jsx(Text, { style: "follow-label", children: "Follow +" }),
        /* @__PURE__ */ jsx(Behavior, { verb: "get", action: "new", href: modalHref })
      ] }),
      401
    );
  }
  const isCurrentlyFollowing = !!await findFollow(creatorId, userId);
  const [err, creator] = await getCreatorPermissionData(creatorId);
  if (err || !creator) {
    return hv(
      /* @__PURE__ */ jsx("text", { xmlns: "https://hyperview.org/hyperview", style: "follow-label", children: "Creator not found" })
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
      /* @__PURE__ */ jsx("text", { xmlns: "https://hyperview.org/hyperview", style: "follow-label", children: "Something went wrong" })
    );
  }
  return hv(
    /* @__PURE__ */ jsx(View, { xmlns: "https://hyperview.org/hyperview", children: /* @__PURE__ */ jsx(
      HyperviewFollowInner,
      {
        creatorId: creator.id,
        baseUrl,
        isActive: !isCurrentlyFollowing
      }
    ) })
  );
};
const postFollowWeb = async (c) => {
  const creatorId = routeParam(c, "creatorId");
  const user = await getUser(c);
  const userId = user?.id;
  if (!userId) {
    return c.html(/* @__PURE__ */ jsx(AuthModal, { action: "to follow this creator." }), 401);
  }
  const body = await c.req.parseBody();
  const isCurrentlyFollowing = body.isFollowing === "true";
  const isCircleButton = body.buttonType === "circle";
  const shouldRefreshCreatorMessages = body.shouldRefreshCreatorMessages === "true";
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
  const message = isCurrentlyFollowing ? `No longer following ${creator.displayName}.` : `Now following ${creator.displayName}.`;
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Alert, { type: "success", message }),
      /* @__PURE__ */ jsx(
        FollowButton,
        {
          creator,
          user,
          isCircleButton,
          shouldRefreshCreatorMessages
        }
      ),
      /* @__PURE__ */ jsx(
        FollowButton,
        {
          creator,
          user,
          isCircleButton,
          variant: "mobile",
          shouldRefreshCreatorMessages
        }
      ),
      shouldRefreshCreatorMessages && dispatchEvents(["creator-messages:updated"])
    ] })
  );
};
export {
  POST
};
