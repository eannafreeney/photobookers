import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import Banner from "../../../components/app/Banner.js";
import Button from "../../../components/app/Button.js";
import FormPost from "../../../components/forms/FormPost.js";
const VerificationStatusBanner = ({
  claimStatus,
  creatorStatus
}) => {
  if (creatorStatus === "verified") return /* @__PURE__ */ jsx(Fragment, {});
  if (claimStatus === "pending_admin_review") {
    return /* @__PURE__ */ jsx(
      Banner,
      {
        type: "info",
        message: "Your creator profile is pending admin review. You can edit books, but publishing is disabled until admin review."
      }
    );
  }
  return /* @__PURE__ */ jsx(
    Banner,
    {
      type: "info",
      message: "Your creator profile is pending verification. You can edit books, but publishing is disabled until verification.",
      children: /* @__PURE__ */ jsx(FormPost, { action: "/auth/resend-verification", "x-target": "toast", children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "warning", children: "Resend verification email" }) })
    }
  );
};
var VerificationStatusBanner_default = VerificationStatusBanner;
export {
  VerificationStatusBanner_default as default
};
