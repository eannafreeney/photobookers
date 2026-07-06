import { jsx } from "hono/jsx/jsx-runtime";
import Banner from "../../../../components/app/Banner.js";
const BookReviewProcessBanner = ({ variant }) => {
  if (variant === "hidden") return null;
  if (variant === "create_moderated") {
    return /* @__PURE__ */ jsx(
      Banner,
      {
        type: "info",
        message: "New books go through review first. That stops once either (1) two books you added since verification have been approved, or (2) you\u2019ve been verified for 30 days and added two books since verification. We\u2019ll email you when this listing is approved.\u201D"
      }
    );
  }
  if (variant === "edit_pending") {
    return /* @__PURE__ */ jsx(
      Banner,
      {
        type: "info",
        message: "This book is awaiting review. You can still edit details below; we will email you when it has been approved or if we need changes."
      }
    );
  }
  if (variant === "edit_rejected") {
    return /* @__PURE__ */ jsx(
      Banner,
      {
        type: "warning",
        message: "This book was not approved yet. Update the details below, then use \u201CResubmit for review\u201D when you are ready to send it back to the team."
      }
    );
  }
  return null;
};
var BookReviewProcessBanner_default = BookReviewProcessBanner;
export {
  BookReviewProcessBanner_default as default
};
