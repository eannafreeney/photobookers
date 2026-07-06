import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../app/Button.js";
import { thumbsUpIcon } from "../../lib/icons.js";
const FormSuccessScreen = ({
  id,
  message
}) => {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      id,
      class: "flex flex-col gap-6 items-center justify-center min-h-screen",
      children: [
        /* @__PURE__ */ jsx("div", { children: thumbsUpIcon() }),
        /* @__PURE__ */ jsx("h2", { class: "text-2xl font-bold", children: "Success" }),
        /* @__PURE__ */ jsx("p", { class: "text-sm text-center grow-0", children: message }),
        /* @__PURE__ */ jsx("a", { href: "/", children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", children: "Go to Homepage" }) })
      ]
    }
  );
};
var FormSuccessScreen_default = FormSuccessScreen;
export {
  FormSuccessScreen_default as default
};
