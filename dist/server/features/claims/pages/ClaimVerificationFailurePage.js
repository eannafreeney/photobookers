import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import AppLayout from "../../../components/layouts/AppLayout.js";
import Page from "../../../components/layouts/Page.js";
const ClaimVerificationFailurePage = ({
  error,
  verificationCode,
  verificationUrl,
  currentPath
}) => {
  return /* @__PURE__ */ jsx(AppLayout, { title: "Verification Failed", currentPath, children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4 items-center justify-center min-h-screen", children: [
    /* @__PURE__ */ jsx("h2", { class: "font-display text-3xl font-medium text-on-surface-strong mb-4", children: "\u274C Verification Failed" }),
    /* @__PURE__ */ jsx("p", { class: "mb-2", children: error || "Could not verify your website." }),
    /* @__PURE__ */ jsxs("p", { class: "text-sm text-gray-600 mb-4", children: [
      "Make sure you've added the code ",
      /* @__PURE__ */ jsx("strong", { children: verificationCode }),
      " ",
      "to your website at ",
      verificationUrl
    ] }),
    /* @__PURE__ */ jsx("p", { class: "text-sm", children: "Please try again in a few minutes." })
  ] }) }) });
};
var ClaimVerificationFailurePage_default = ClaimVerificationFailurePage;
export {
  ClaimVerificationFailurePage_default as default
};
