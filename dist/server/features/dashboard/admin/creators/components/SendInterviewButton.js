import { jsx } from "hono/jsx/jsx-runtime";
import Pill from "../../../../../components/app/Pill.js";
import Button from "../../../../../components/app/Button.js";
const SendInterviewButton = ({ creator }) => {
  if (creator.email === null) {
    return /* @__PURE__ */ jsx(Pill, { variant: "warning", children: "No Email" });
  }
  const id = `send-interview-${creator.id}`;
  if (creator.interviewEmailSent) {
    return /* @__PURE__ */ jsx("div", { id, children: /* @__PURE__ */ jsx(Pill, { variant: "success", children: "Email Sent" }) });
  }
  const alpineAttrs = {
    "x-target": id,
    "x-target.error": "toast",
    "@ajax:before": "confirm('Send interview invite?') || $event.preventDefault()"
  };
  return /* @__PURE__ */ jsx(
    "form",
    {
      id,
      method: "post",
      action: `/dashboard/admin/creators/${creator.id}/send-interview`,
      ...alpineAttrs,
      children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "inverse", children: /* @__PURE__ */ jsx("span", { children: "Send Interview" }) })
    }
  );
};
var SendInterviewButton_default = SendInterviewButton;
export {
  SendInterviewButton_default as default
};
