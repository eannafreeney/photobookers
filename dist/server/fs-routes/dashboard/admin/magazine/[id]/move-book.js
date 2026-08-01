import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../../lib/validator.js";
import { idSchema } from "../../../../../features/app/schema.js";
import { magazineMoveBookSchema } from "../../../../../features/dashboard/admin/magazine/schema.js";
import { getIssueByIdForAdmin } from "../../../../../domain/magazine/queries.js";
import { moveIssueBook } from "../../../../../domain/magazine/mutations.js";
import { SelectedBooksList } from "../../../../../features/dashboard/admin/magazine/components/SelectedBooks.js";
import Alert from "../../../../../components/app/Alert.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
const POST = createRoute(
  paramValidator(idSchema),
  formValidator(magazineMoveBookSchema),
  async (c) => {
    const id = c.req.valid("param").id;
    const { bookId, direction } = c.req.valid("form");
    const [moveErr] = await moveIssueBook(id, bookId, direction);
    if (moveErr) return showErrorAlert(c, moveErr.reason);
    const [loadErr, issue] = await getIssueByIdForAdmin(id);
    if (loadErr || !issue) {
      return showErrorAlert(c, loadErr?.reason ?? "Issue not found");
    }
    const action = `/dashboard/admin/magazine/${id}`;
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(SelectedBooksList, { issue, action }),
        /* @__PURE__ */ jsx(Alert, { type: "success", message: "Order updated" })
      ] })
    );
  }
);
export {
  POST
};
