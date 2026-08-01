import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../../lib/validator.js";
import { idSchema } from "../../../../../features/app/schema.js";
import { magazineArtistQuoteFormSchema } from "../../../../../features/dashboard/admin/magazine/schema.js";
import { updateIssueBookArtistQuote } from "../../../../../domain/magazine/mutations.js";
import { showErrorAlert, showSuccessAlert } from "../../../../../lib/alertHelpers.js";
const POST = createRoute(
  paramValidator(idSchema),
  formValidator(magazineArtistQuoteFormSchema),
  async (c) => {
    const id = c.req.valid("param").id;
    const form = c.req.valid("form");
    const body = await c.req.parseBody();
    const bookId = typeof body.bookId === "string" ? body.bookId : "";
    if (!bookId) return showErrorAlert(c, "Missing book.");
    const quote = form.quote?.trim() || null;
    const [error] = await updateIssueBookArtistQuote(id, bookId, quote);
    if (error) return showErrorAlert(c, error.reason);
    return showSuccessAlert(c, "Artist answer saved.");
  }
);
export {
  POST
};
