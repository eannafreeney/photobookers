import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import FollowButton from "../../features/api/components/FollowButton.js";
import CardCreatorCard from "./CardCreatorCard.js";
const MobileCreatorCard = ({ creator, user }) => {
  if (!creator) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsx("div", { class: "grow", children: /* @__PURE__ */ jsx(CardCreatorCard, { creator, avatarSize: "sm" }) }),
    /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(FollowButton, { creator, variant: "mobile", user }) })
  ] });
};
var MobileCreatorCard_default = MobileCreatorCard;
export {
  MobileCreatorCard_default as default
};
