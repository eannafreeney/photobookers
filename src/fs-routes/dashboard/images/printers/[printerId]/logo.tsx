import { createRoute } from "hono-fsr";
import { paramValidator, validateImageFile } from "../../../../../lib/validator";
import { printerIdSchema } from "../../../../../features/dashboard/admin/printers/schema";
import { routeParam } from "../../../../../lib/routeParam";
import { showErrorAlert, showSuccessAlert } from "../../../../../lib/alertHelpers";
import { uploadImage } from "../../../../../services/storage";
import { updatePrinterLogo } from "../../../../../features/dashboard/admin/printers/services";

export const POST = createRoute(
  paramValidator(printerIdSchema),
  async (c) => {
    const printerId = routeParam(c, "printerId");
    const body = await c.req.parseBody();
    const validatedFile = validateImageFile(body.cover);
    if (!validatedFile.success) return showErrorAlert(c, validatedFile.error);

    try {
      const result = await uploadImage(
        validatedFile.file,
        `printers/${printerId}/logo`,
        "cover",
      );
      const [error] = await updatePrinterLogo(printerId, result.url);
      if (error) return showErrorAlert(c, error.reason);
      return showSuccessAlert(c, "Logo updated");
    } catch (error) {
      console.error("Failed to upload printer logo", error);
      return showErrorAlert(c, "Failed to upload logo");
    }
  },
);
