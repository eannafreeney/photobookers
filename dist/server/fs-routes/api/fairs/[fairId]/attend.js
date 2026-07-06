import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils.js";
import AuthModal from "../../../../components/app/AuthModal.js";
import { showErrorAlert } from "../../../../lib/alertHelpers.js";
import Alert from "../../../../components/app/Alert.js";
import {
  requestFairAttendance,
  withdrawFairAttendance,
  isCreatorAttendingFair
} from "../../../../features/fair-attendees/services.js";
import { db } from "../../../../db/client.js";
import { bookFairs } from "../../../../db/schema.js";
import { eq } from "drizzle-orm";
import {
  canClaimFairAttendance,
  canWithdrawFairAttendance
} from "../../../../lib/permissions.js";
import WebFairAttendButton from "../../../../features/app/fairs/components/FairAttendButton.js";
import WebFairAttendingCreators from "../../../../features/app/fairs/components/FairAttendingCreators.js";
import { hyperview } from "../../../../lib/hxml.js";
import { getIsHyperview } from "../../../../features/hyperview/lib.js";
import { getBaseUrl } from "../../../../lib/hyperview.js";
import { Behavior, Text, View } from "../../../../lib/hxml-comps.js";
import HyperviewFairAttendButton from "../../../../features/hyperview/components/FairAttendButton.js";
import { routeParam } from "../../../../lib/routeParam.js";
const getFairForAttend = async (fairId) => {
  return db.query.bookFairs.findFirst({
    where: eq(bookFairs.id, fairId),
    columns: {
      id: true,
      name: true,
      slug: true,
      status: true,
      approvalStatus: true,
      startDate: true,
      endDate: true
    }
  });
};
const renderAttendResponse = async (c, fairId, user, message, isAttending) => {
  const fair = await getFairForAttend(fairId);
  if (!fair) return showErrorAlert(c, "Fair not found");
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Alert, { type: "success", message }),
      /* @__PURE__ */ jsx(WebFairAttendButton, { fair, user, isAttending }),
      /* @__PURE__ */ jsx(WebFairAttendingCreators, { fairId })
    ] })
  );
};
const renderAttendResponseHyperview = async (c, fairId, user, isAttending) => {
  const fair = await getFairForAttend(fairId);
  const baseUrl = getBaseUrl(c);
  const hv = hyperview(c);
  if (!fair) {
    return hv(
      /* @__PURE__ */ jsx("text", { xmlns: "https://hyperview.org/hyperview", style: "fair-attend-hint", children: "Fair not found" })
    );
  }
  return hv(
    /* @__PURE__ */ jsxs(View, { xmlns: "https://hyperview.org/hyperview", children: [
      /* @__PURE__ */ jsx(
        HyperviewFairAttendButton,
        {
          fair,
          user,
          baseUrl,
          isAttending
        }
      ),
      /* @__PURE__ */ jsx(View, { hide: "true", children: /* @__PURE__ */ jsx(
        Behavior,
        {
          trigger: "load",
          verb: "get",
          action: "replace",
          target: "fair-attending-creators",
          href: `${baseUrl}/hyperview/fairs/${fair.slug}/attending-creators`
        }
      ) })
    ] })
  );
};
const renderAttendErrorHyperview = (c, message) => {
  const hv = hyperview(c);
  return hv(
    /* @__PURE__ */ jsx("text", { xmlns: "https://hyperview.org/hyperview", style: "fair-attend-hint", children: message })
  );
};
const renderAttendAuthHyperview = (c) => {
  const baseUrl = getBaseUrl(c);
  const hv = hyperview(c);
  const modalHref = `${baseUrl}/hyperview/auth-modal?action=${encodeURIComponent("to mark yourself as attending this fair.")}`;
  return hv(
    /* @__PURE__ */ jsxs(View, { xmlns: "https://hyperview.org/hyperview", children: [
      /* @__PURE__ */ jsx(Behavior, { trigger: "load", action: "new", verb: "get", href: modalHref }),
      /* @__PURE__ */ jsx(Text, { style: "fair-attend-label", children: "I'm attending this fair" }),
      /* @__PURE__ */ jsx(Behavior, { verb: "get", action: "new", href: modalHref })
    ] }),
    401
  );
};
const POST = createRoute(async (c) => {
  const isHyperview = getIsHyperview(c);
  return isHyperview ? postAttendHyperview(c) : postAttendWeb(c);
});
const DELETE = createRoute(async (c) => {
  const isHyperview = getIsHyperview(c);
  return isHyperview ? deleteAttendHyperview(c) : deleteAttendWeb(c);
});
const postAttendWeb = async (c) => {
  const fairId = routeParam(c, "fairId");
  const user = await getUser(c);
  if (!user?.id) {
    return c.html(
      /* @__PURE__ */ jsx(AuthModal, { action: "to mark yourself as attending this fair." }),
      401
    );
  }
  if (!user.creator) {
    return showErrorAlert(c, "You need a creator profile to attend fairs");
  }
  const fair = await getFairForAttend(fairId);
  if (!fair) return showErrorAlert(c, "Fair not found");
  if (!canClaimFairAttendance(user, fair)) {
    return showErrorAlert(c, "You cannot request attendance at this fair");
  }
  const [attendingError, alreadyAttending] = await isCreatorAttendingFair(
    fairId,
    user.creator.id
  );
  if (attendingError) return showErrorAlert(c, attendingError.reason);
  if (alreadyAttending) {
    return renderAttendResponse(
      c,
      fairId,
      user,
      "You are already attending this fair.",
      true
    );
  }
  const [error] = await requestFairAttendance(fairId, user.creator.id);
  if (error) return showErrorAlert(c, error.reason);
  return renderAttendResponse(
    c,
    fairId,
    user,
    "You're now marked as attending this fair.",
    true
  );
};
const deleteAttendWeb = async (c) => {
  const fairId = routeParam(c, "fairId");
  const user = await getUser(c);
  if (!user?.id) {
    return c.html(/* @__PURE__ */ jsx(AuthModal, { action: "to update your fair attendance." }), 401);
  }
  if (!user.creator) {
    return showErrorAlert(c, "You need a creator profile");
  }
  const fair = await getFairForAttend(fairId);
  if (!fair) return showErrorAlert(c, "Fair not found");
  if (!canWithdrawFairAttendance(user, fair, user.creator.id)) {
    return showErrorAlert(c, "You cannot withdraw from this fair");
  }
  const [error] = await withdrawFairAttendance(fairId, user.creator.id);
  if (error) return showErrorAlert(c, error.reason);
  return renderAttendResponse(
    c,
    fairId,
    user,
    "You are no longer marked as attending this fair.",
    false
  );
};
const postAttendHyperview = async (c) => {
  const fairId = routeParam(c, "fairId");
  const user = await getUser(c);
  if (!user?.id) {
    return renderAttendAuthHyperview(c);
  }
  if (!user.creator) {
    return renderAttendErrorHyperview(
      c,
      "You need a creator profile to attend fairs"
    );
  }
  const fair = await getFairForAttend(fairId);
  if (!fair) return renderAttendErrorHyperview(c, "Fair not found");
  if (!canClaimFairAttendance(user, fair)) {
    return renderAttendErrorHyperview(
      c,
      "You cannot request attendance at this fair"
    );
  }
  const [attendingError, alreadyAttending] = await isCreatorAttendingFair(
    fairId,
    user.creator.id
  );
  if (attendingError) {
    return renderAttendErrorHyperview(c, attendingError.reason);
  }
  if (alreadyAttending) {
    return renderAttendResponseHyperview(c, fairId, user, true);
  }
  const [error] = await requestFairAttendance(fairId, user.creator.id);
  if (error) return renderAttendErrorHyperview(c, error.reason);
  return renderAttendResponseHyperview(c, fairId, user, true);
};
const deleteAttendHyperview = async (c) => {
  const fairId = routeParam(c, "fairId");
  const user = await getUser(c);
  if (!user?.id) {
    return renderAttendAuthHyperview(c);
  }
  if (!user.creator) {
    return renderAttendErrorHyperview(c, "You need a creator profile");
  }
  const fair = await getFairForAttend(fairId);
  if (!fair) return renderAttendErrorHyperview(c, "Fair not found");
  if (!canWithdrawFairAttendance(user, fair, user.creator.id)) {
    return renderAttendErrorHyperview(c, "You cannot withdraw from this fair");
  }
  const [error] = await withdrawFairAttendance(fairId, user.creator.id);
  if (error) return renderAttendErrorHyperview(c, error.reason);
  return renderAttendResponseHyperview(c, fairId, user, false);
};
export {
  DELETE,
  POST
};
