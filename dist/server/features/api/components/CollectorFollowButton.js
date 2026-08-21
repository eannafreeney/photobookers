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
        /* @__PURE__ */ jsx("span", { "x-show": "isSubmitting", "x-cloak": true, children: isFollowing ? "Follow" : "Following" }),
        /* @__PURE__ */ jsx("span", { "x-show": isFollowing ? "isSubmitting" : "!isSubmitting", "x-cloak": true, children: followIcon }),
        /* @__PURE__ */ jsx("span", { "x-show": isFollowing ? "!isSubmitting" : "isSubmitting", "x-cloak": true, children: followingIcon })
      ] })
    }
  );
};
var CollectorFollowButton_default = CollectorFollowButton;
const followIcon = /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    "stroke-width": "1.5",
    stroke: "currentColor",
    class: "size-4",
    children: /* @__PURE__ */ jsx(
      "path",
      {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        d: "M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
      }
    )
  }
);
const followingIcon = /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    "stroke-width": "1.5",
    stroke: "currentColor",
    class: "size-4",
    children: /* @__PURE__ */ jsx(
      "path",
      {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        d: "m4.5 12.75 6 6 9-13.5"
      }
    )
  }
);
export {
  CollectorFollowButton_default as default
};
