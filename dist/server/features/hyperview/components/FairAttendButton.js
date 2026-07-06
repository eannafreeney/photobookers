import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Behavior, Style, Text, View } from "../../../lib/hxml-comps.js";
import {
  canClaimFairAttendance,
  canWithdrawFairAttendance
} from "../../../lib/permissions.js";
const fairAttendButtonId = (fairId) => `fair-attend-${fairId}`;
const fairAttendanceSectionId = (fairId) => `fair-attendance-${fairId}`;
const HyperviewFairAttendInner = ({
  fair,
  user,
  baseUrl,
  isAttending
}) => {
  const action = `${baseUrl}/api/fairs/${fair.id}/attend`;
  const sectionTarget = fairAttendanceSectionId(fair.id);
  if (isAttending) {
    const canWithdraw = user?.creator && canWithdrawFairAttendance(user, fair, user.creator.id);
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Text, { style: "fair-attend-status", children: "You're attending" }),
      canWithdraw ? /* @__PURE__ */ jsxs(View, { style: "fair-attend-withdraw", children: [
        /* @__PURE__ */ jsx(Text, { style: "fair-attend-withdraw-label", children: "Withdraw" }),
        /* @__PURE__ */ jsx(
          Behavior,
          {
            verb: "delete",
            action: "replace-inner",
            href: action,
            target: sectionTarget
          }
        )
      ] }) : null
    ] });
  }
  if (!user) {
    const modalHref = `${baseUrl}/hyperview/auth-modal?action=${encodeURIComponent("to mark yourself as attending this fair.")}`;
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Text, { style: "fair-attend-label", children: "I'm attending this fair" }),
      /* @__PURE__ */ jsx(Behavior, { verb: "get", action: "new", href: modalHref })
    ] });
  }
  if (!user.creator) {
    return /* @__PURE__ */ jsx(Text, { style: "fair-attend-hint", children: "Set up your creator profile to mark yourself as attending." });
  }
  if (user.creator.status !== "verified") {
    return /* @__PURE__ */ jsx(Text, { style: "fair-attend-hint", children: "Only verified creators can mark attendance at fairs." });
  }
  if (!canClaimFairAttendance(user, fair)) {
    return /* @__PURE__ */ jsx(Fragment, {});
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Text, { style: "fair-attend-label", children: "I'm attending this fair" }),
    /* @__PURE__ */ jsx(
      Behavior,
      {
        verb: "post",
        action: "replace-inner",
        href: action,
        target: sectionTarget
      }
    )
  ] });
};
const FairAttendButton = (props) => {
  const buttonId = fairAttendButtonId(props.fair.id);
  const today = new Date((/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0));
  const isPastFair = new Date(props.fair.endDate) < today;
  if (isPastFair) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsx(View, { style: "fair-attend-btn", id: buttonId, children: /* @__PURE__ */ jsx(HyperviewFairAttendInner, { ...props }) });
};
var FairAttendButton_default = FairAttendButton;
const fairAttendButtonStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "fair-attend-btn",
      borderWidth: 1,
      borderColor: "#191613",
      borderRadius: 0,
      paddingTop: 14,
      paddingBottom: 14,
      paddingLeft: 20,
      paddingRight: 20,
      alignItems: "center",
      marginTop: 8,
      marginBottom: 8
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "fair-attend-label",
      fontSize: 15,
      fontWeight: "600",
      color: "#191613"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "fair-attend-status",
      fontSize: 14,
      fontWeight: "600",
      color: "#a22c29"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "fair-attend-hint",
      fontSize: 13,
      color: "#45413a",
      textAlign: "center",
      lineHeight: 20
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "fair-attend-withdraw",
      marginTop: 8,
      paddingTop: 4,
      paddingBottom: 4,
      alignItems: "center"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "fair-attend-withdraw-label",
      fontSize: 13,
      color: "#45413a",
      textDecorationLine: "underline"
    }
  )
] });
export {
  HyperviewFairAttendInner,
  FairAttendButton_default as default,
  fairAttendButtonId,
  fairAttendButtonStyles,
  fairAttendanceSectionId
};
