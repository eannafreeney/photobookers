import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator";
import { printerIdSchema } from "../../../../../features/dashboard/admin/printers/schema";
import { routeParam } from "../../../../../lib/routeParam";
import { showErrorAlert, showSuccessAlert } from "../../../../../lib/alertHelpers";
import { removeInvalidImages, uploadImage } from "../../../../../services/storage";
import {
  addPrinterImages,
  deletePrinterImage,
} from "../../../../../features/dashboard/admin/printers/services";

export const POST = createRoute(
  paramValidator(printerIdSchema),
  async (c) => {
    const printerId = routeParam(c, "printerId");
    const body = await c.req.parseBody({ all: true });
    const files = body.images
      ? Array.isArray(body.images)
        ? body.images
        : [body.images]
      : [];
    const validFiles = files.filter(removeInvalidImages);
    if (validFiles.length === 0) {
      return showErrorAlert(c, "Choose at least one image");
    }

    const urls: string[] = [];
    for (const file of validFiles) {
      const uploaded = await uploadImage(
        file,
        `printers/${printerId}/gallery`,
        "gallery",
      );
      urls.push(uploaded.url);
    }

    const [error] = await addPrinterImages(printerId, urls);
    if (error) return showErrorAlert(c, error.reason);
    return c.redirect(`/dashboard/admin/printers/${printerId}`, 303);
  },
);

export const DELETE = createRoute(
  paramValidator(printerIdSchema),
  async (c) => {
    const printerId = routeParam(c, "printerId");
    const imageId = c.req.query("imageId");
    if (!imageId) return showErrorAlert(c, "Image not found", 404);
    const [error] = await deletePrinterImage(printerId, imageId);
    if (error) return showErrorAlert(c, error.reason);
    return showSuccessAlert(c, "Image removed");
  },
);
