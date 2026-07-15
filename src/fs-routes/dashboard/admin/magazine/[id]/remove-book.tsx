import { createRoute } from "hono-fsr";
import { paramValidator } from "@/lib/validator";
import { idSchema } from "@/features/app/schema";
import { removeIssueBook } from "@/domain/magazine/mutations";
import { showErrorAlert, showSuccessAlert } from "@/lib/alertHelpers";

export const POST = createRoute(paramValidator(idSchema), async (c) => {
  const id = c.req.valid("param").id;
  const body = await c.req.parseBody();
  const bookId = typeof body.bookId === "string" ? body.bookId : "";
  if (!bookId) return showErrorAlert(c, "Missing book.");

  const [error] = await removeIssueBook(id, bookId);
  if (error) return showErrorAlert(c, error.reason);
  return showSuccessAlert(c, "Book removed.");
});
