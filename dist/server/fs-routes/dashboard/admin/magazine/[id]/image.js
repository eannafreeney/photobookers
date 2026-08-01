import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../../lib/validator.js";
import { idSchema } from "../../../../../features/app/schema.js";
import { magazineImageFormSchema } from "../../../../../features/dashboard/admin/magazine/schema.js";
import { getIssueByIdForAdmin } from "../../../../../domain/magazine/queries.js";
import { updateIssueBookImage } from "../../../../../domain/magazine/mutations.js";
import SelectImageModal, {
  collectPlacementImageOptions
} from "../../../../../features/dashboard/admin/magazine/components/SelectImageModal.js";
import IssueBookCard from "../../../../../features/dashboard/admin/magazine/components/IssueBookCard.js";
import Alert from "../../../../../components/app/Alert.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
const GET = createRoute(paramValidator(idSchema), async (c) => {
  const id = c.req.valid("param").id;
  const bookId = c.req.query("bookId") ?? "";
  if (!bookId) return showErrorAlert(c, "Missing book.");
  const [error, issue] = await getIssueByIdForAdmin(id);
  if (error || !issue) {
    return showErrorAlert(c, error?.reason ?? "Issue not found");
  }
  const placement = issue.placements.find((p) => p.bookId === bookId);
  if (!placement) return showErrorAlert(c, "Book is not in this issue");
  const action = `/dashboard/admin/magazine/${id}`;
  return c.html(
    /* @__PURE__ */ jsx(
      SelectImageModal,
      {
        action,
        bookId: placement.bookId,
        number: placement.number,
        title: placement.book?.title ?? "Untitled",
        imageOptions: collectPlacementImageOptions(placement.book),
        selectedImageUrl: placement.selectedImageUrl
      }
    )
  );
});
const POST = createRoute(
  paramValidator(idSchema),
  formValidator(magazineImageFormSchema),
  async (c) => {
    const id = c.req.valid("param").id;
    const { bookId, imageUrl } = c.req.valid("form");
    const selectedImageUrl = imageUrl?.trim() || null;
    const [saveErr] = await updateIssueBookImage(id, bookId, selectedImageUrl);
    if (saveErr) return showErrorAlert(c, saveErr.reason);
    const [loadErr, issue] = await getIssueByIdForAdmin(id);
    if (loadErr || !issue) {
      return showErrorAlert(c, loadErr?.reason ?? "Issue not found");
    }
    const placement = issue.placements.find((p) => p.bookId === bookId);
    if (!placement) {
      return showErrorAlert(c, "Image saved, but the card failed to render.");
    }
    const action = `/dashboard/admin/magazine/${id}`;
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          IssueBookCard,
          {
            number: placement.number,
            bookId: placement.bookId,
            book: placement.book,
            blurb: placement.blurb,
            action,
            selectedImageUrl: placement.selectedImageUrl,
            artistPrompt: placement.artistPrompt,
            artistQuote: placement.artistQuote,
            artistEmailSentAt: placement.artistEmailSentAt
          }
        ),
        /* @__PURE__ */ jsx(Alert, { type: "success", message: "Featured image updated." })
      ] })
    );
  }
);
export {
  GET,
  POST
};
