import {
  approveBookById,
  createBook,
  deleteBookById,
  prepareBookData,
  prepareBookUpdateData,
  rejectBookById,
  updateBook,
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
import { formValidator, paramValidator } from "../lib/validator";
import { resolveArtist, resolvePublisher } from "../services/creators";
import Alert from "../components/app/Alert";
import BooksForApprovalTable from "../components/cms/ui/BooksForApprovalTable";
import {
  requireBookDeleteAccess,
  requireBookEditAccess,
  requireBookPublishAccess,
  requireBookUnpublishAccess,
} from "../middleware/bookGuard";
import { showErrorAlert } from "../lib/alertHelpers";
import { getIsMobile } from "../lib/device";
import { BooksOverviewTable } from "../components/dashboard/BooksOverviewTable";
import { limitBooksPerDay } from "../middleware/booksPerDayLimit";

export const booksDashboardRoutes = new Hono();

// OVERVIEW PAGE
booksDashboardRoutes.get("/", async (c) => {
  const searchQuery = c.req.query("search");
  const user = await getUser(c);
  const flash = await getFlash(c);
  const isMobile = getIsMobile(c.req.header("user-agent") ?? "");

  const currentPath = c.req.path;

  console.log("searchQuery", searchQuery);

  return c.html(
    <BooksOverview
      searchQuery={searchQuery}
      user={user}
      flash={flash}
      currentPath={currentPath}
      isMobile={isMobile}
    />,
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
  limitBooksPerDay,
  formValidator(bookFormSchema),
  async (c) => {
    const user = await getUser(c);
    const formData = c.req.valid("form");

    if (!user.creator) {
      return showErrorAlert(c, "No Creator Profile Found");
    }

    const artist = await resolveArtist(formData, user.id);

    if (artist === "error" || !artist) {
      return showErrorAlert(c, "Invalid artist");
    }

    const bookData = await prepareBookData(
      formData,
      artist,
      user.id,
      user.creator,
    );
    const newBook = await createBook(bookData);

    if (!newBook) {
      return c.html(
        <Alert type="danger" message="Failed to create book" />,
        422,
      );
    }

    await setFlash(c, "success", `${newBook.title} created!`);
    return c.redirect("/dashboard/books");
  },
);

// CREATE NEW BOOK AS ARTIST
booksDashboardRoutes.post(
  "/new/artist",
  limitBooksPerDay,
  formValidator(bookFormSchema),
  async (c) => {
    const user = await getUser(c);
    const formData = c.req.valid("form");

    if (!user.creator) {
      return showErrorAlert(c, "No Creator Profile Found");
    }

    const publisher = await resolvePublisher(formData, user.id);

    if (publisher === "error") {
      return showErrorAlert(c, "Invalid publisher");
    }

    const bookData = await prepareBookData(
      formData,
      user.creator,
      user.id,
      publisher,
    );

    const newBook = await createBook(bookData);

    if (!newBook) {
      return showErrorAlert(c, "Failed to create book");
    }

    await setFlash(c, "success", `Successfully created "${newBook.title}"!`);
    return c.redirect("/dashboard/books");
  },
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
  },
);

// EDIT BOOK AS PUBLISHER
booksDashboardRoutes.post(
  "/edit/:bookId/publisher",
  paramValidator(bookIdSchema),
  formValidator(bookFormSchema),
  requireBookEditAccess,
  async (c) => {
    const formData = c.req.valid("form");
    const book = c.get("book");

    const bookData = prepareBookUpdateData(formData);
    const updatedBook = await updateBook(bookData, book.id);

    if (!updatedBook) return showErrorAlert(c, "Failed to update book");

    return c.html(
      <Alert type="success" message={`${updatedBook.title} updated!`} />,
    );
  },
);

// EDIT BOOK AS ARTIST
booksDashboardRoutes.post(
  "/edit/:bookId/artist",
  requireBookEditAccess,
  formValidator(bookFormSchema),
  requireBookEditAccess,
  async (c) => {
    const formData = c.req.valid("form");
    const book = c.get("book");

    const bookData = prepareBookUpdateData(formData);
    const updatedBook = await updateBook(bookData, book.id);

    if (!updatedBook) {
      return showErrorAlert(c, "Failed to update book");
    }

    return c.html(
      <Alert type="success" message={`${updatedBook.title} updated!`} />,
    );
  },
);

// DELETE BOOK
booksDashboardRoutes.post(
  "/delete/:bookId",
  paramValidator(bookIdSchema),
  requireBookDeleteAccess,
  async (c) => {
    const bookId = c.req.valid("param").bookId;
    const user = await getUser(c);
    const isMobile = getIsMobile(c.req.header("user-agent") ?? "");

    if (!user.creator) return showErrorAlert(c, "No Creator Profile Found");

    const deletedBook = await deleteBookById(bookId);

    if (!deletedBook) {
      return showErrorAlert(c, "Failed to delete book");
    }

    return c.html(
      <>
        <Alert type="success" message={`${deletedBook.title} deleted!`} />
        <BooksOverviewTable
          searchQuery={undefined}
          creator={user.creator}
          user={user}
          isMobile={isMobile}
        />
      </>,
    );
  },
);

// MAKE BOOK PUBLIC
booksDashboardRoutes.post(
  "/:bookId/publish",
  requireBookPublishAccess,
  async (c) => {
    const book = c.get("book");
    const user = await getUser(c);

    if (!book) {
      return c.html(<Alert type="danger" message="Book not found" />, 422);
    }

    const result = await updateBookPublicationStatus(book.id, "published");

    if (!result.success) {
      return c.html(<Alert type="danger" message={result.error} />, 400);
    }

    const updatedBook = result.book;

    return c.html(
      <>
        <Alert
          type="success"
          message={`${updatedBook?.title ?? "Book"} Published!`}
        />
        <PublishToggleForm book={updatedBook} />
        <PreviewButton book={updatedBook} user={user} />
      </>,
    );
  },
);

// MAKE BOOK DRAFT
booksDashboardRoutes.post(
  "/:bookId/unpublish",
  requireBookUnpublishAccess,
  async (c) => {
    const book = c.get("book");
    const user = await getUser(c);

    const result = await updateBookPublicationStatus(book.id, "draft");

    if (!result.success) {
      return c.html(
        <>
          <Alert type="danger" message={result.error} />
          <PublishToggleForm book={book} />
        </>,
        400,
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
        <PreviewButton book={updatedBook} user={user} />
      </>,
    );
  },
);

// Add book cover image to book profile
// booksDashboardRoutes.post(
//   "/edit/:bookId/cover",
//   paramValidator(bookIdSchema),
//   async (c) => {
//     const bookId = c.req.valid("param").bookId;
//     const body = await c.req.parseBody();

//     const validatedFile = validateImageFile(body.cover);
//     if (!validatedFile.success) {
//       return c.html(<Alert type="danger" message={validatedFile.error} />, 422);
//     }

//     let coverUrl: string | null = null;
//     try {
//       const result = await uploadImage(
//         validatedFile.file,
//         `books/covers/${bookId}`,
//       );
//       coverUrl = result.url;
//     } catch (error) {
//       return c.html(
//         <Alert type="danger" message="Failed to upload image" />,
//         422,
//       );
//     }
//     const updatedBook = await updateBookCoverImage(bookId, coverUrl);

//     if (!updatedBook) {
//       return c.html(
//         <Alert type="danger" message="Failed to update book cover" />,
//         422,
//       );
//     }

//     return c.html(<Alert type="success" message="Cover updated!" />);
//   },
// );

// // Add book image to book profile
// booksDashboardRoutes.post(
//   "/edit/:bookId/images",
//   paramValidator(bookIdSchema),
//   async (c) => {
//     const bookId = c.req.valid("param").bookId;
//     const body = await c.req.parseBody({ all: true });

//     // 1. Get the uploaded files (body.gallery will be File | File[] or undefined)
//     const galleryFiles = body.images
//       ? Array.isArray(body.images)
//         ? body.images
//         : [body.images]
//       : [];

//     // Filter to valid image files only
//     const validFiles = galleryFiles.filter(removeInvalidImages);

//     // 2. Parse removed image IDs
//     const removedIds: string[] = body.removedIds
//       ? JSON.parse(body.removedIds as string)
//       : [];

//     // 3. Delete removed images from DB
//     if (removedIds.length > 0) {
//       await db
//         .delete(bookImages)
//         .where(
//           and(eq(bookImages.bookId, bookId), inArray(bookImages.id, removedIds))
//         );
//     }

//     // 4. Upload new images and save to DB
//     try {
//       if (validFiles.length > 0) {
//         await uploadImages(validFiles, bookId);
//       }
//     } catch (error) {
//       return c.html(
//         <Alert type="danger" message="Failed to upload images" />,
//         422
//       );
//     }

//     await setFlash(c, "success", `Images updated!`);
//     return c.redirect(`/dashboard/books/edit/${bookId}`);
//   }
// );

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
        422,
      );
    }
    const updatedBook = await approveBookById(bookId);

    if (!updatedBook) {
      return c.html(
        <Alert type="danger" message="Failed to approve book" />,
        422,
      );
    }

    return c.html(
      <>
        <Alert type="success" message="Book Approved!" />
        <BooksForApprovalTable creatorId={user.creator.id} />
      </>,
    );
  },
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
        422,
      );
    }
    const updatedBook = await rejectBookById(bookId);

    if (!updatedBook) {
      return c.html(
        <Alert type="danger" message="Failed to reject book" />,
        422,
      );
    }

    return c.html(
      <>
        <Alert type="success" message="Book Rejected!" />
        <BooksForApprovalTable creatorId={user.creator.id} />
      </>,
    );
  },
);
