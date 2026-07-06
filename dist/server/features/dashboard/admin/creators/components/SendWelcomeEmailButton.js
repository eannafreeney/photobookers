import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import Pill from "../../../../../components/app/Pill.js";
import Button from "../../../../../components/app/Button.js";
const SendWelcomeEmailButton = ({ creator }) => {
  if (creator.status === "verified") return /* @__PURE__ */ jsx(Fragment, {});
  const id = `send-welcome-email-${creator.id}`;
  if (creator.welcomeEmailSent) {
    return /* @__PURE__ */ jsx("div", { id, children: /* @__PURE__ */ jsx(Pill, { variant: "success", children: "Email Sent" }) });
  }
  if (!creator.email) return /* @__PURE__ */ jsx(Pill, { variant: "danger", children: "No email" });
  const alpineAttrs = {
    "x-target": id,
    "x-target.error": "toast",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()"
  };
  return /* @__PURE__ */ jsx(
    "form",
    {
      id,
      method: "post",
      action: `/dashboard/admin/creators/${creator.id}/send-welcome-email`,
      ...alpineAttrs,
      children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "inverse", children: /* @__PURE__ */ jsx("span", { children: "Send Welcome Email" }) })
    }
  );
};
var SendWelcomeEmailButton_default = SendWelcomeEmailButton;
export {
  SendWelcomeEmailButton_default as default
};
