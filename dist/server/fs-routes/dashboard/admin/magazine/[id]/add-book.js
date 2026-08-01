import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../../lib/validator.js";
import { idSchema } from "../../../../../features/app/schema.js";
import { magazineBookActionSchema } from "../../../../../features/dashboard/admin/magazine/schema.js";
import {
  getIssueByIdForAdmin,
  searchBooksForIssue
} from "../../../../../domain/magazine/queries.js";
import { addIssueBook } from "../../../../../domain/magazine/mutations.js";
import AddBookModal from "../../../../../features/dashboard/admin/magazine/components/AddBookModal.js";
import { SelectedBooksList } from "../../../../../features/dashboard/admin/magazine/components/SelectedBooks.js";
import Alert from "../../../../../components/app/Alert.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
const GET = createRoute(paramValidator(idSchema), async (c) => {
  const id = c.req.valid("param").id;
  const query = c.req.query("q") ?? "";
  const [error, issue] = await getIssueByIdForAdmin(id);
  if (error || !issue) {
    return showErrorAlert(c, error?.reason ?? "Issue not found");
  }
  const results = await searchBooksForIssue(id, query);
  const action = `/dashboard/admin/magazine/${id}`;
  return c.html(
    /* @__PURE__ */ jsx(AddBookModal, { action, query, results })
  );
});
const POST = createRoute(
  paramValidator(idSchema),
  formValidator(magazineBookActionSchema),
  async (c) => {
    const id = c.req.valid("param").id;
    const { bookId } = c.req.valid("form");
    const [addErr] = await addIssueBook(id, bookId);
    if (addErr) return showErrorAlert(c, addErr.reason);
    const [loadErr, issue] = await getIssueByIdForAdmin(id);
    if (loadErr || !issue) {
      return showErrorAlert(c, loadErr?.reason ?? "Issue not found");
    }
    const action = `/dashboard/admin/magazine/${id}`;
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(SelectedBooksList, { issue, action }),
        /* @__PURE__ */ jsx(Alert, { type: "success", message: "Book added" })
      ] })
    );
  }
);
export {
  GET,
  POST
};
