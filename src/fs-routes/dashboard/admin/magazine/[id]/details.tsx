import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "@/lib/validator";
import { idSchema } from "@/features/app/schema";
import { magazineDetailsFormSchema } from "@/features/dashboard/admin/magazine/schema";
import { updateIssueDetails } from "@/domain/magazine/mutations";
import { showErrorAlert, showSuccessAlert } from "@/lib/alertHelpers";

export const POST = createRoute(
  paramValidator(idSchema),
  formValidator(magazineDetailsFormSchema),
  async (c) => {
    const id = c.req.valid("param").id;
    const form = c.req.valid("form");

    const paragraphs = (form.editorsLetter ?? "")
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    const [error] = await updateIssueDetails(id, {
      title: form.title.trim(),
      subtitle: form.subtitle?.trim() || null,
      editorsLetterTitle: form.editorsLetterTitle?.trim() || null,
      editorsLetter: paragraphs,
    });

    if (error) return showErrorAlert(c, error.reason);
    return showSuccessAlert(c, "Details saved.");
  },
);
