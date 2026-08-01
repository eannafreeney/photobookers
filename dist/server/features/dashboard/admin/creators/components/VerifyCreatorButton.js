import { jsx } from "hono/jsx/jsx-runtime";
import Pill from "../../../../../components/app/Pill.js";
import Button from "../../../../../components/app/Button.js";
const VerifyCreatorButton = ({ creator }) => {
  const id = `verify-creator-${creator.id}`;
  if (creator.status === "verified") {
    return /* @__PURE__ */ jsx("div", { id, children: /* @__PURE__ */ jsx(Pill, { variant: "success", children: "Verified" }) });
  }
  const alpineAttrs = {
    "x-target": id,
    "x-target.error": "toast",
    "@ajax:before": "confirm('Verify this creator profile?') || $event.preventDefault()"
  };
  return /* @__PURE__ */ jsx(
    "form",
    {
      id,
      method: "post",
      action: `/dashboard/admin/creators/${creator.id}/verify`,
      ...alpineAttrs,
      children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "primary", children: /* @__PURE__ */ jsx("span", { children: "Verify" }) })
    }
  );
};
var VerifyCreatorButton_default = VerifyCreatorButton;
export {
  VerifyCreatorButton_default as default
};
