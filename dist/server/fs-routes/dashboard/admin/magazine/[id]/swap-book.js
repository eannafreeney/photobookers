import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../../lib/validator.js";
import { idSchema } from "../../../../../features/app/schema.js";
import { magazineBookActionSchema } from "../../../../../features/dashboard/admin/magazine/schema.js";
import {
  getBookCardById,
  getIssueByIdForAdmin
} from "../../../../../domain/magazine/queries.js";
import { swapIssueBook } from "../../../../../domain/magazine/mutations.js";
import { findReplacementForBook } from "../../../../../features/dashboard/admin/magazine/generate.js";
import IssueBookCard from "../../../../../features/dashboard/admin/magazine/components/IssueBookCard.js";
import Alert from "../../../../../components/app/Alert.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
const POST = createRoute(
  paramValidator(idSchema),
  formValidator(magazineBookActionSchema),
  async (c) => {
    const id = c.req.valid("param").id;
    const { bookId } = c.req.valid("form");
    const [loadErr, issue] = await getIssueByIdForAdmin(id);
    if (loadErr || !issue) {
      return showErrorAlert(c, loadErr?.reason ?? "Issue not found");
    }
    const slot = issue.placements.find((p) => p.bookId === bookId);
    if (!slot) return showErrorAlert(c, "Book is not in this issue");
    const [genErr, replacement] = await findReplacementForBook(issue, bookId);
    if (genErr) return showErrorAlert(c, genErr.reason);
    const [swapErr] = await swapIssueBook(id, bookId, replacement.bookId, {
      blurb: replacement.blurb,
      artistPrompt: replacement.artistPrompt
    });
    if (swapErr) return showErrorAlert(c, swapErr.reason);
    const book = await getBookCardById(replacement.bookId);
    const action = `/dashboard/admin/magazine/${id}`;
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          IssueBookCard,
          {
            number: slot.number,
            bookId: replacement.bookId,
            book,
            blurb: replacement.blurb,
            action,
            artistPrompt: replacement.artistPrompt
          }
        ),
        /* @__PURE__ */ jsx(Alert, { type: "success", message: "Book swapped" })
      ] })
    );
  }
);
export {
  POST
};
