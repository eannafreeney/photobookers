import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator.js";
import { bookIdSchema } from "../../../../../schemas/index.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
import { approveBook } from "../../../../../features/dashboard/admin/books/services.js";
import BookApprovalStatusPill from "../../../../../features/dashboard/admin/books/components/BookApprovalStatusPill.js";
import Alert from "../../../../../components/app/Alert.js";
const POST = createRoute(paramValidator(bookIdSchema), async (c) => {
  const { bookId } = c.req.valid("param");
  const [error, book] = await approveBook(bookId);
  if (error) return showErrorAlert(c, error.reason);
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Alert, { type: "success", message: "Book approved!" }),
      /* @__PURE__ */ jsx(
        BookApprovalStatusPill,
        {
          approvalStatus: book.approvalStatus ?? "approved"
        }
      )
    ] })
  );
});
export {
  POST
};
