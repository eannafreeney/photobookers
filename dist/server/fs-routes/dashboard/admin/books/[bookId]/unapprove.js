import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import Alert from "../../../../../components/app/Alert.js";
import BookApprovalForm from "../../../../../features/dashboard/admin/books/forms/BookApprovalForm.js";
import { unapproveBook } from "../../../../../features/dashboard/admin/books/services.js";
import PublishToggleForm from "../../../../../features/dashboard/books/components/PublishToggleForm.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
import { paramValidator } from "../../../../../lib/validator.js";
import { bookIdSchema } from "../../../../../schemas/index.js";
import { getUser } from "../../../../../utils.js";
const POST = createRoute(paramValidator(bookIdSchema), async (c) => {
  const user = await getUser(c);
  const { bookId } = c.req.valid("param");
  const [error, book] = await unapproveBook(bookId);
  if (error) return showErrorAlert(c, error.reason);
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Alert, { type: "success", message: "Book returned to pending review." }),
      /* @__PURE__ */ jsx(BookApprovalForm, { book }),
      /* @__PURE__ */ jsx(PublishToggleForm, { book, user })
    ] })
  );
});
export {
  POST
};
