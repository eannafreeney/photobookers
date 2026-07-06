import { jsx } from "hono/jsx/jsx-runtime";
import { AppLayout } from "../../../fs-routes/hyperview/+layout.js";
const ErrorScreen = ({ user, baseUrl, message }) => {
  return /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", children: /* @__PURE__ */ jsx(AppLayout, { title: "Error", user, baseUrl, children: /* @__PURE__ */ jsx("text", { children: message }) }) });
};
var ErrorScreen_default = ErrorScreen;
export {
  ErrorScreen_default as default
};
