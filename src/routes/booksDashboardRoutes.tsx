import {
  approveBookById,
  createBook,
  deleteBookById,
  getBookById,
  prepareBookData,
  prepareBookUpdateData,
  processTags,
  rejectBookById,
  updateBook,
  updateBookCoverImage,
  updateBookPublicationStatus,
} from "../services/books";
import { getFlash, getUser, setFlash } from "../utils";
import BooksOverview from "../pages/dashboard/BooksOverview";
import AddBookPage from "../pages/dashboard/AddBookPage";
import BookEditPage from "../pages/dashboard/BookEditPage";
import { Hono } from "hono";
import PublishToggleForm from "../components/cms/forms/PublishToggleForm";
import PreviewButton from "../components/api/PreviewButton";
import { bookFormSchema, bookIdSchema } from "../schemas";
import {
  removeInvalidImages,
  uploadImage,
  uploadImages,
} from "../services/storage";
import {
  formValidator,
  paramValidator,
  validateImageFile,
} from "../lib/validator";
import { getOrCreateArtist, getOrCreatePublisher } from "../services/creators";
import Alert from "../components/app/Alert";
import { bookImages, Creator } from "../db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "../db/client";
import { BookTable } from "../components/cms/ui/BookTable";
import BooksForApprovalTable from "../components/cms/ui/BooksForApprovalTable";

export const booksDashboardRoutes = new Hono();

// OVERVIEW PAGE
booksDashboardRoutes.get("/", async (c) => {
  const searchQuery = c.req.query("search");
  const user = await getUser(c);
  const flash = await getFlash(c);

  const currentPath = c.req.path;

  return c.html(
    <BooksOverview
      searchQuery={searchQuery}
      user={user}
      flash={flash}
      currentPath={currentPath}
    />
  );
});

// GET ADD NEW BOOK PAGE
booksDashboardRoutes.get("/new", async (c) => {
  const user = await getUser(c);
  return c.html(<AddBookPage user={user} />);
});

// CREATE NEW BOOK AS PUBLISHER
booksDashboardRoutes.post(
  "/new/publisher",
  formValidator(bookFormSchema),
  async (c) => {
    const user = await getUser(c);
    const formData = c.req.valid("form");

    if (!user.creator) {
      return c.html(
        <Alert type="danger" message="No Creator Profile Found" />,
        422
      );
    }

    const artist = await getOrCreateArtist(formData, user);
    if (!artist) {
      return c.html(
        <Alert type="danger" message="No Artist Profile Found" />,
        422
      );
    }

    const bookData = await prepareBookData(
      formData,
      artist,
      user.id,
      user.creator
    );
    const newBook = await createBook(bookData);

    if (!newBook) {
      return c.html(
        <Alert type="danger" message="Failed to create book" />,
        422
      );
    }

    await setFlash(c, "success", `${newBook.title} created!`);
    return c.redirect("/dashboard/books");
  }
);

// CREATE NEW BOOK AS ARTIST
booksDashboardRoutes.post(
  "/new/artist",
  formValidator(bookFormSchema),
  async (c) => {
    const user = await getUser(c);
    const formData = c.req.valid("form");

    if (!user.creator) {
      return c.html(
        <Alert type="danger" message="No Creator Profile Found" />,
        422
      );
    }

    let publisher: Creator | null = null;
    if (formData.publisher_id || formData.new_publisher_name) {
      publisher = await getOrCreatePublisher(formData, user);
      if (!publisher) {
        return c.html(
          <Alert type="danger" message="No Publisher Profile Found" />,
          422
        );
      }
    }

    const bookData = await prepareBookData(
      formData,
      user.creator,
      user.id,
      publisher
    );
    const newBook = await createBook(bookData);

    if (!newBook) {
      return c.html(
        <Alert type="danger" message="Failed to create book" />,
        422
      );
    }

    await setFlash(c, "success", `${newBook.title} created!`);
    return c.redirect("/dashboard/books");
  }
);

// GET EDIT BOOK PAGE
booksDashboardRoutes.get(
  "/edit/:bookId",
  paramValidator(bookIdSchema),
  async (c) => {
    const bookId = c.req.valid("param").bookId;
    const user = await getUser(c);
    const flash = await getFlash(c);

    return c.html(<BookEditPage user={user} bookId={bookId} flash={flash} />);
  }
);

// EDIT BOOK
booksDashboardRoutes.post(
  "/edit/:bookId/publisher",
  paramValidator(bookIdSchema),
  formValidator(bookFormSchema),
  async (c) => {
    const user = await getUser(c);
    const bookId = c.req.valid("param").bookId;
    const formData = c.req.valid("form");

    const tags = processTags(formData.tags);

    const bookData = prepareBookUpdateData(formData, tags);
    const updatedBook = await updateBook(bookData, bookId, user.id);

    if (!updatedBook) {
      return c.html(
        <Alert type="danger" message="Failed to update book" />,
        422
      );
    }

    return c.html(
      <Alert type="success" message={`${updatedBook.title} updated!`} />
    );
  }
);

// DELETE BOOK
booksDashboardRoutes.post(
  "/delete/:bookId",
  paramValidator(bookIdSchema),
  async (c) => {
    const bookId = c.req.valid("param").bookId;
    const user = await getUser(c);

    if (!user.creator) {
      return c.html(
        <Alert type="danger" message="No Creator Profile Found" />,
        422
      );
    }

    const deletedBook = await deleteBookById(bookId);

    if (!deletedBook) {
      return c.html(
        <Alert type="danger" message="Failed to delete book" />,
        422
      );
    }

    return c.html(
      <>
        <Alert type="success" message={`${deletedBook.title} deleted!`} />
        <BookTable searchQuery={undefined} creatorId={user.creator.id} />
      </>
    );
  }
);

// MAKE BOOK PUBLIC
booksDashboardRoutes.post("/:bookId/publish", async (c) => {
  const bookId = c.req.param("bookId");
  const book = await getBookById(bookId);

  if (!book) {
    return c.html(<Alert type="danger" message="Book not found" />, 422);
  }

  if (!book?.coverUrl) {
    return c.html(
      <>
        <Alert type="danger" message="Add a cover image before publishing" />
        <PublishToggleForm book={book} />
      </>,
      400
    );
  }

  const result = await updateBookPublicationStatus(bookId, "published");

  if (!result.success) {
    return c.html(
      <>
        <Alert type="danger" message={result.error} />
        <PublishToggleForm book={book} />
      </>,
      400
    );
  }

  const updatedBook = result.book;

  return c.html(
    <>
      <Alert
        type="success"
        message={`${updatedBook?.title ?? "Book"} Published!`}
      />
      <PublishToggleForm book={updatedBook} />
      <PreviewButton book={updatedBook} />
    </>
  );
});

// MAKE BOOK DRAFT
booksDashboardRoutes.post("/:bookId/unpublish", async (c) => {
  const bookId = c.req.param("bookId");
  const book = await getBookById(bookId);

  if (!book) {
    return c.html(<Alert type="danger" message="Book not found" />, 422);
  }

  const result = await updateBookPublicationStatus(bookId, "draft");

  if (!result.success) {
    return c.html(
      <>
        <Alert type="danger" message={result.error} />
        <PublishToggleForm book={book} />
      </>,
      400
    );
  }

  const updatedBook = result.book;

  return c.html(
    <>
      <Alert
        type="warning"
        message={`${updatedBook?.title ?? "Book"} Unpublished!`}
      />
      <PublishToggleForm book={updatedBook} />
      <PreviewButton book={updatedBook} />
    </>
  );
});

// Add book cover image to book profile
booksDashboardRoutes.post(
  "/edit/:bookId/cover",
  paramValidator(bookIdSchema),
  async (c) => {
    const bookId = c.req.valid("param").bookId;
    const body = await c.req.parseBody();

    const validatedFile = validateImageFile(body.cover);
    if (!validatedFile.success) {
      return c.html(<Alert type="danger" message={validatedFile.error} />, 422);
    }

    let coverUrl: string | null = null;
    try {
      const result = await uploadImage(
        validatedFile.file,
        `books/covers/${bookId}`
      );
      coverUrl = result.url;
    } catch (error) {
      return c.html(
        <Alert type="danger" message="Failed to upload image" />,
        422
      );
    }
    const updatedBook = await updateBookCoverImage(bookId, coverUrl);

    if (!updatedBook) {
      return c.html(
        <Alert type="danger" message="Failed to update book cover" />,
        422
      );
    }

    return c.html(<Alert type="success" message="Cover updated!" />);
  }
);

// Add book image to book profile
booksDashboardRoutes.post(
  "/edit/:bookId/images",
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
      // The IDs from your form are like "existing-0", "existing-1" etc.
      // You'll need to map these to actual DB records
      // Option A: If you change frontend to send actual DB UUIDs:
      await db
        .delete(bookImages)
        .where(
          and(eq(bookImages.bookId, bookId), inArray(bookImages.id, removedIds))
        );
    }

    // 4. Upload new images and save to DB
    if (validFiles.length > 0) {
      await uploadImages(validFiles, bookId);
    }

    await setFlash(c, "success", `Images updated!`);
    return c.redirect(`/dashboard/books/edit/${bookId}`);
  }
);

// APPROVE BOOK CREATED BY OTHER CREATOR
booksDashboardRoutes.post(
  "/:bookId/approve",
  paramValidator(bookIdSchema),
  async (c) => {
    const bookId = c.req.valid("param").bookId;
    const user = await getUser(c);

    if (!user.creator) {
      return c.html(
        <Alert type="danger" message="No Creator Profile Found" />,
        422
      );
    }
    const updatedBook = await approveBookById(bookId);

    if (!updatedBook) {
      return c.html(
        <Alert type="danger" message="Failed to approve book" />,
        422
      );
    }

    return c.html(
      <>
        <Alert type="success" message="Book Approved!" />
        <div x-sync id="server_events">
          <div x-init="$dispatch('book:approved')"></div>
        </div>
        <BooksForApprovalTable creatorId={user.creator.id} />
      </>
    );
  }
);

// REJECT BOOK CREATED BY OTHER CREATOR
booksDashboardRoutes.post(
  "/:bookId/reject",
  paramValidator(bookIdSchema),
  async (c) => {
    const bookId = c.req.valid("param").bookId;
    const user = await getUser(c);

    if (!user.creator) {
      return c.html(
        <Alert type="danger" message="No Creator Profile Found" />,
        422
      );
    }
    const updatedBook = await rejectBookById(bookId);

    if (!updatedBook) {
      return c.html(
        <Alert type="danger" message="Failed to reject book" />,
        422
      );
    }

    return c.html(
      <>
        <Alert type="success" message="Book Rejected!" />
        <BooksForApprovalTable creatorId={user.creator.id} />
      </>
    );
  }
);
