import { jsx } from "hono/jsx/jsx-runtime";
import Banner from "../../../../components/app/Banner.js";
const BookReviewProcessBanner = ({ variant }) => {
  if (variant === "hidden") return null;
  if (variant === "create_moderated") {
    return /* @__PURE__ */ jsx(
      Banner,
      {
        type: "info",
        message: "New books are reviewed by the team before they can be published. Add a cover image, then submit for review and we\u2019ll email you once the listing has been approved or if we need changes."
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
