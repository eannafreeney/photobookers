import {
    updateBookCoverImage,
  } from "../services/books";
  import { setFlash } from "../utils";
  import { Context, Hono } from "hono";
  import {  bookIdSchema, creatorIdSchema } from "../schemas";
  import {
    removeInvalidImages,
    uploadImage,
    uploadImages,
  } from "../services/storage";
  import {
    paramValidator,
    validateImageFile,
  } from "../lib/validator";
  import Alert from "../components/app/Alert";
  import { bookImages } from "../db/schema";
  import { and, eq, inArray } from "drizzle-orm";
  import { db } from "../db/client";
import { updateCreatorCoverImage } from "../services/creators";
  
  export const imageRoutes = new Hono();
  
  export const showErrorAlert = (
    c: Context,
    errorMessage: string = "Action Failed! Please try again."
  ) => c.html(<Alert type="danger" message={errorMessage} />, 422);
  

// Add image to creator profile
imageRoutes.post(
    "creators/:creatorId/cover",
    paramValidator(creatorIdSchema),
    async (c) => {
      const creatorId = c.req.valid("param").creatorId;
      const body = await c.req.parseBody();
  
      const validatedFile = validateImageFile(body.cover);
      if (!validatedFile.success) {
        return c.html(<Alert type="danger" message={validatedFile.error} />, 422);
      }
  
  
      let coverUrl: string | null = null;
      try {
        const result = await uploadImage(
          validatedFile.file,
          `creators/covers/${creatorId}`
        );
        coverUrl = result.url;
      } catch (error) {
        return c.html(<Alert type="danger" message="Failed to upload image" />);
      }
  
      const updatedCreator = await updateCreatorCoverImage(coverUrl, creatorId);
  
      return c.html(
        <Alert
          type="success"
          message={`${updatedCreator?.displayName ?? "Book"} Updated!`}
        />
      );
    }
  );
  
  // Add book cover image to book page
  imageRoutes.post(
    "/books/:bookId/cover",
    paramValidator(bookIdSchema),
    async (c) => {
      const bookId = c.req.valid("param").bookId;
      const body = await c.req.parseBody();
  
      const validatedFile = validateImageFile(body.cover);
      if (!validatedFile.success) {
        return showErrorAlert(c, validatedFile.error);
      }
  
      let coverUrl: string | null = null;
      try {
        const result = await uploadImage(
          validatedFile.file,
          `books/covers/${bookId}`
        );
        coverUrl = result.url;
      } catch (error) {
        console.log(error, "error in upload cover image");
        return showErrorAlert(c, "Failed to upload cover image");
      }
      const updatedBook = await updateBookCoverImage(bookId, coverUrl);
  
      if (!updatedBook) {
        return showErrorAlert(c, "Failed to update book cover");
      }
  
      return c.html(<Alert type="success" message="Cover updated!" />);
    }
  );
  
  // Add book image to book profile
  imageRoutes.post(
    "/:bookId/gallery",
    paramValidator(bookIdSchema),
    async (c) => {
      const bookId = c.req.valid("param").bookId;
      const body = await c.req.parseBody({ all: true });
  
      // 1. Get the uploaded files (body.gallery will be File | File[] or undefined)
      const galleryFiles = body.images
        ? Array.isArray(body.images)
          ? body.images
          : [body.images]
        : [];
  
      // Filter to valid image files only
      const validFiles = galleryFiles.filter(removeInvalidImages);
  
      // 2. Parse removed image IDs
      const removedIds: string[] = body.removedIds
        ? JSON.parse(body.removedIds as string)
        : [];
  
      // 3. Delete removed images from DB
      if (removedIds.length > 0) {
        await db
          .delete(bookImages)
          .where(
            and(eq(bookImages.bookId, bookId), inArray(bookImages.id, removedIds))
          );
      }
  
      // 4. Upload new images and save to DB
      try {
        if (validFiles.length > 0) {
          await uploadImages(validFiles, bookId);
        }
      } catch (error) {
        console.log(error, "error in upload images");
        return c.html(
          <Alert type="danger" message="Failed to upload images" />,
          422
        );
      }

      console.log("Images updated!");
      
  
      return c.html(<Alert type="success" message="Images updated!" />);
    }
  );
  
