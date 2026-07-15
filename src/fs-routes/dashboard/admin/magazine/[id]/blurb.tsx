import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "@/lib/validator";
import { idSchema } from "@/features/app/schema";
import { magazineBlurbFormSchema } from "@/features/dashboard/admin/magazine/schema";
import { updateIssueBookBlurb } from "@/domain/magazine/mutations";
import { showErrorAlert, showSuccessAlert } from "@/lib/alertHelpers";

export const POST = createRoute(
  paramValidator(idSchema),
  formValidator(magazineBlurbFormSchema),
  async (c) => {
    const id = c.req.valid("param").id;
    const form = c.req.valid("form");
    const body = await c.req.parseBody();
    const bookId = typeof body.bookId === "string" ? body.bookId : "";
    if (!bookId) return showErrorAlert(c, "Missing book.");

    const blurb = form.blurb?.trim() || null;
    const [error] = await updateIssueBookBlurb(id, bookId, blurb);

    if (error) return showErrorAlert(c, error.reason);
    return showSuccessAlert(c, "Description saved.");
  },
);
