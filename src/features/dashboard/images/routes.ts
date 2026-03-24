import { Hono } from "hono";
import {
  requireBookImageEditAccess,
  requireProfileCoverImageEditAccess,
} from "../../../middleware/imageGuards";
import { paramValidator } from "../../../lib/validator";
import { bookIdSchema, creatorIdSchema, userIdSchema } from "../../../schemas";
import {
  updateBookCover,
  updateCreatorCover,
  updateUserProfileImage,
  uploadGalleryImages,
} from "./controllers";

export const imageRoutes = new Hono();

imageRoutes.post(
  "/creators/:creatorId/cover",
  paramValidator(creatorIdSchema),
  requireProfileCoverImageEditAccess,
  updateCreatorCover,
);
imageRoutes.post(
  "/books/:bookId/cover",
  paramValidator(bookIdSchema),
  requireBookImageEditAccess,
  updateBookCover,
);
imageRoutes.post(
  "/books/:bookId/gallery",
  paramValidator(bookIdSchema),
  requireBookImageEditAccess,
  uploadGalleryImages,
);
imageRoutes.post(
  "/users/:userId/profile",
  paramValidator(userIdSchema),
  // requireUserProfileImageEditAccess,
  updateUserProfileImage,
);