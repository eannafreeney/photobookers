import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { findUserFollow } from "../../../db/queries.js";
import { canFollowCollector } from "../collectorFollow.js";
import APIButton from "./APIButton.js";
const CollectorFollowButton = async ({
  targetUserId,
  user
}) => {
  let isFollowing = false;
  if (user?.id) {
    isFollowing = !!await findUserFollow(targetUserId, user.id);
  }
  const isDisabled = !canFollowCollector(user?.id, targetUserId);
  const id = `collector-follow-${targetUserId}`;
  return /* @__PURE__ */ jsx(
    APIButton,
    {
      id,
      action: `/api/users/${targetUserId}/follow`,
      isDisabled,
      isActive: isFollowing,
      hiddenInput: { name: "isFollowing", value: isFollowing },
      buttonText: /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("span", { "x-show": "!isSubmitting", children: isFollowing ? "Following" : "Follow" }),
        /* @__PURE__ */ jsx("span", { "x-show": "isSubmitting", "x-cloak": true, children: isFollowing ? "Follow" : "Following" })
      ] })
    }
  );
};
var CollectorFollowButton_default = CollectorFollowButton;
export {
  CollectorFollowButton_default as default
};
