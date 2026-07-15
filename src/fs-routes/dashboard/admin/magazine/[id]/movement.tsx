import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "@/lib/validator";
import { idSchema } from "@/features/app/schema";
import { magazineMovementFormSchema } from "@/features/dashboard/admin/magazine/schema";
import { updateIssueMovement } from "@/domain/magazine/mutations";
import { showErrorAlert, showSuccessAlert } from "@/lib/alertHelpers";

export const POST = createRoute(
  paramValidator(idSchema),
  formValidator(magazineMovementFormSchema),
  async (c) => {
    const id = c.req.valid("param").id;
    const form = c.req.valid("form");
    const body = await c.req.parseBody();
    const movementId =
      typeof body.movementId === "string" ? body.movementId : "";
    if (!movementId) return showErrorAlert(c, "Missing movement.");

    const [error] = await updateIssueMovement(id, movementId, {
      kicker: form.kicker.trim(),
      lead: form.lead.trim(),
      title: form.title.trim(),
    });

    if (error) return showErrorAlert(c, error.reason);
    return showSuccessAlert(c, "Movement saved.");
  },
);
