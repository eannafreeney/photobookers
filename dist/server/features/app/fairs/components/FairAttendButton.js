import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../../components/app/Button.js";
import Link from "../../../../components/app/Link.js";
import {
  canClaimFairAttendance,
  canWithdrawFairAttendance
} from "../../../../lib/permissions.js";
import FormDelete from "../../../../components/forms/FormDelete.js";
const FairAttendButton = ({
  fair,
  user,
  isAttending
}) => {
  const today = new Date((/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0));
  const isPastFair = new Date(fair.endDate) < today;
  if (isPastFair) return null;
  const buttonId = `fair-attend-${fair.id}`;
  const action = `/api/fairs/${fair.id}/attend`;
  const alpineAttrs = {
    "x-data": "{ isSubmitting: false }",
    "@ajax:before": "isSubmitting = true",
    "@ajax:after": "isSubmitting = false",
    "@ajax:error": "isSubmitting = false",
    "x-target": `${buttonId} fair-attending-creators toast modal-root`,
    "x-target.error": "toast modal-root",
    "x-target.401": "modal-root"
  };
  if (!user) {
    return /* @__PURE__ */ jsx("div", { id: buttonId, class: "pt-4 flex justify-center", children: /* @__PURE__ */ jsx("form", { method: "post", action, ...alpineAttrs, children: /* @__PURE__ */ jsxs(Button, { variant: "solid", color: "primary", type: "submit", children: [
      /* @__PURE__ */ jsx("span", { "x-show": "!isSubmitting", children: "I'm attending this fair" }),
      /* @__PURE__ */ jsx("span", { "x-show": "isSubmitting", "x-cloak": true, children: "Submitting..." })
    ] }) }) });
  }
  if (!user.creator) {
    return /* @__PURE__ */ jsxs("div", { id: buttonId, class: "pt-4 text-center text-sm text-on-surface-muted", children: [
      /* @__PURE__ */ jsx(Link, { href: "/dashboard", className: "text-accent hover:underline", children: "Set up your creator profile" }),
      " ",
      "to mark yourself as attending."
    ] });
  }
  if (user.creator.status !== "verified") {
    return /* @__PURE__ */ jsx("div", { id: buttonId, class: "pt-4 text-center text-sm text-on-surface-muted", children: "Only verified creators can mark attendance at fairs." });
  }
  if (isAttending) {
    const canWithdraw = canWithdrawFairAttendance(user, fair, user.creator.id);
    return /* @__PURE__ */ jsxs("div", { id: buttonId, class: "pt-4 flex flex-col items-center gap-2", children: [
      /* @__PURE__ */ jsx("span", { class: "px-4 py-2 text-sm font-medium text-accent border border-accent rounded-radius", children: "You're attending" }),
      canWithdraw && /* @__PURE__ */ jsx(FormDelete, { action, ...alpineAttrs, children: /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          class: "text-sm text-on-surface-muted hover:text-accent underline underline-offset-4 cursor-pointer",
          children: "Withdraw"
        }
      ) })
    ] });
  }
  if (!canClaimFairAttendance(user, fair)) {
    return null;
  }
  return /* @__PURE__ */ jsx("div", { id: buttonId, class: "pt-4 flex justify-center", children: /* @__PURE__ */ jsx("form", { method: "post", action, ...alpineAttrs, children: /* @__PURE__ */ jsxs(Button, { variant: "solid", color: "primary", type: "submit", children: [
    /* @__PURE__ */ jsx("span", { "x-show": "!isSubmitting", children: "I'm attending this fair" }),
    /* @__PURE__ */ jsx("span", { "x-show": "isSubmitting", "x-cloak": true, children: "Submitting..." })
  ] }) }) });
};
var FairAttendButton_default = FairAttendButton;
export {
  FairAttendButton_default as default
};
