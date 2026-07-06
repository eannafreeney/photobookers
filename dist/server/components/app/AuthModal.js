import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "./Button.js";
import Link from "./Link.js";
import Modal from "./Modal.js";
const AuthModal = ({
  action,
  redirectUrl,
  registerButtonUrl = "/auth/accounts"
}) => {
  return /* @__PURE__ */ jsx(Modal, { title: `Please login or register ${action}`, children: /* @__PURE__ */ jsxs("div", { class: "flex items-center justify-center gap-2", children: [
    /* @__PURE__ */ jsx(
      Link,
      {
        href: `/auth/login${redirectUrl ? `?redirectUrl=${redirectUrl}` : ""}`,
        className: "w-full",
        children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "primary", width: "full", children: /* @__PURE__ */ jsx("span", { children: "Login" }) })
      }
    ),
    /* @__PURE__ */ jsx(Link, { href: registerButtonUrl, className: "w-full", children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", width: "full", children: /* @__PURE__ */ jsx("span", { children: "Register" }) }) })
  ] }) });
};
var AuthModal_default = AuthModal;
export {
  AuthModal_default as default
};
