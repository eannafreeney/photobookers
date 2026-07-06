import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Behavior, Style, Text, View } from "../../../lib/hxml-comps.js";
const HyperviewFollowInner = ({
  creatorId,
  baseUrl,
  isActive
}) => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(Text, { style: "follow-label", children: isActive ? "Following \u2713" : "Follow +" }),
  /* @__PURE__ */ jsx(
    Behavior,
    {
      action: "replace-inner",
      verb: "post",
      href: `${baseUrl}/api/creators/${creatorId}/follow`,
      target: `follow-btn-${creatorId}`
    }
  )
] });
const FollowButton = ({ creatorId, baseUrl, isActive }) => {
  return /* @__PURE__ */ jsx(View, { style: "follow-btn", id: `follow-btn-${creatorId}`, children: /* @__PURE__ */ jsx(
    HyperviewFollowInner,
    {
      creatorId,
      baseUrl,
      isActive
    }
  ) });
};
var FollowButton_default = FollowButton;
const followButtonStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "follow-btn",
      paddingTop: 12,
      paddingBottom: 12,
      paddingLeft: 16,
      paddingRight: 16,
      borderRadius: 0,
      backgroundColor: "#191613",
      alignItems: "center",
      width: "100%"
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "follow-label", fontSize: 14, fontWeight: "600", color: "#fbfaf7" })
] });
export {
  HyperviewFollowInner,
  FollowButton_default as default,
  followButtonStyles
};
