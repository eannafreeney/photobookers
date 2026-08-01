import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator.js";
import { idSchema } from "../../../../../features/app/schema.js";
import { removeIssueBook } from "../../../../../domain/magazine/mutations.js";
import { showErrorAlert, showSuccessAlert } from "../../../../../lib/alertHelpers.js";
const POST = createRoute(paramValidator(idSchema), async (c) => {
  const id = c.req.valid("param").id;
  const body = await c.req.parseBody();
  const bookId = typeof body.bookId === "string" ? body.bookId : "";
  if (!bookId) return showErrorAlert(c, "Missing book.");
  const [error] = await removeIssueBook(id, bookId);
  if (error) return showErrorAlert(c, error.reason);
  return showSuccessAlert(c, "Book removed.");
});
export {
  POST
};
