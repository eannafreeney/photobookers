import { Hono } from "hono";
import {
  requireBookImageEditAccess,
  requireProfileCoverImageEditAccess,
} from "../../../middleware/imageGuards";
import { paramValidator } from "../../../lib/validator";
import { bookIdSchema, creatorIdSchema } from "../../../schemas";
import { updateBookCover, uploadGalleryImages } from "./controllers";

export const imageRoutes = new Hono();

imageRoutes.post(
  "creators/:creatorId/cover",
  paramValidator(creatorIdSchema),
  requireProfileCoverImageEditAccess,
);
imageRoutes.post(
  "/books/:bookId/cover",
  requireBookImageEditAccess,
  paramValidator(bookIdSchema),
  updateBookCover,
);
imageRoutes.post(
  "/:bookId/gallery",
  requireBookImageEditAccess,
  paramValidator(bookIdSchema),
  uploadGalleryImages,
);
