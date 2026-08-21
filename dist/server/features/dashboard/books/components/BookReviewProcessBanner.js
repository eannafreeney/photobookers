import { jsx } from "hono/jsx/jsx-runtime";
import Banner from "../../../../components/app/Banner.js";
const BookReviewProcessBanner = ({ variant }) => {
  if (variant === "hidden" || variant === "create_trusted") return null;
  const banner = variant === "create_moderated" ? /* @__PURE__ */ jsx(
    Banner,
    {
      type: "info",
      message: "Save the book details first, then add a cover image on the next step. Once you have a cover, you can submit for review."
    }
  ) : variant === "edit_pending" ? /* @__PURE__ */ jsx(
    Banner,
    {
      type: "info",
      message: "This book is awaiting review. You can still edit details below; we will email you when it has been approved or if we need changes."
    }
  ) : /* @__PURE__ */ jsx(
    Banner,
    {
      type: "warning",
      message: `This book was not approved yet. Update the details below, then use "Resubmit for review" when you are ready to send it back to the team.`
    }
  );
  return /* @__PURE__ */ jsx("div", { class: "mb-4", children: banner });
};
var BookReviewProcessBanner_default = BookReviewProcessBanner;
export {
  BookReviewProcessBanner_default as default
};
