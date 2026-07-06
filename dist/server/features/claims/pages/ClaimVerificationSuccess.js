import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import AppLayout from "../../../components/layouts/AppLayout.js";
import Page from "../../../components/layouts/Page.js";
const ClaimVerificationSuccess = ({ currentPath }) => {
  return /* @__PURE__ */ jsx(AppLayout, { title: "Verification Successful", currentPath, children: /* @__PURE__ */ jsxs(Page, { children: [
    /* @__PURE__ */ jsx("h2", { class: "font-display text-3xl font-medium text-on-surface-strong mb-4", children: "\u2705 Verification Successful!" }),
    /* @__PURE__ */ jsx("p", { children: "Your creator profile has been claimed successfully. You can now manage it from your dashboard." }),
    /* @__PURE__ */ jsx(
      "a",
      {
        href: "/dashboard",
        class: "mt-4 inline-block text-blue-600 underline",
        children: "Go to Dashboard"
      }
    )
  ] }) });
};
var ClaimVerificationSuccess_default = ClaimVerificationSuccess;
export {
  ClaimVerificationSuccess_default as default
};
