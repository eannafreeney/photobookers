import { createRoute } from "hono-fsr";
import { getUser } from "../../../utils";
import { getFlash } from "../../../utils";
import InfoPage from "../../../pages/InfoPage";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import Breadcrumbs from "../../../features/dashboard/admin/components/Breadcrumbs";
import {
  buildUpdateBookData,
  deleteBookById,
  getBookById,
  updateBook,
  updateBookPublicationStatus,
} from "../../../features/dashboard/books/services";
import PublishToggleForm from "../../../features/dashboard/books/components/PublishToggleForm";
import PreviewButton from "../../../features/api/components/PreviewButton";
import BookCoverForm from "../../../features/dashboard/images/forms/BookCoverForm";
import BookGalleryForm from "../../../features/dashboard/images/forms/BookGalleryForm";
import { BookForm } from "../../../features/dashboard/books/forms/BookForm";
import {
  BookFormWithBookContext,
  BookIdContext,
} from "../../../features/dashboard/books/types";
import { bookFormSchema } from "../../../features/dashboard/books/schema";
import { formValidator, paramValidator } from "../../../lib/validator";
import { bookIdSchema } from "../../../schemas";
import {
  requireBookDeleteAccess,
  requireBookEditAccess,
  requireBookPublishIntentAccess,
} from "../../../middleware/bookGuard";
import { showErrorAlert, showSuccessAlert } from "../../../lib/alertHelpers";
import Alert from "../../../components/app/Alert";
import { dispatchEvents } from "../../../lib/disatchEvents";
import { createBookPublishedNotification } from "../../../features/dashboard/admin/notifications/utils";

export const GET = createRoute(
  paramValidator(bookIdSchema),
  async (c: BookIdContext) => {
    const bookId = c.req.valid("param").bookId;
    const user = await getUser(c);
    const flash = await getFlash(c);
    const currentPath = c.req.path;

    const [err, book] = await getBookById(bookId);

    if (err || !book) {
      return c.html(<InfoPage errorMessage="Book not found" user={user} />);
    }

    const formValues = {
      title: book.title,
      artist_id: book.artistId,
      publisher_id: book.publisherId,
      description: book.description,
      purchase_link: book.purchaseLink,
      tags: book.tags?.join(", "),
      availability_status: book.availabilityStatus,
      release_date: book?.releaseDate
        ? new Date(book.releaseDate).toISOString().split("T")[0]
        : "",
    };

    const publisherIsVerified = book?.publisher?.status === "verified";

    const isPublisher = user.creator?.type === "publisher";

    return c.html(
      <AppLayout
        title="Edit Book"
        user={user}
        flash={flash}
        currentPath={currentPath}
      >
        <Page>
          <Breadcrumbs
            items={[
              { label: "Books Overview", href: "/dashboard/books" },
              {
                label: `Edit "${book.title}"`,
              },
            ]}
          />
          {!publisherIsVerified && (
            <div class="flex justify-end">
              <div class="flex items-center gap-4">
                <PublishToggleForm book={book} user={user} />
                <PreviewButton book={book} user={user} />
              </div>
            </div>
          )}
          <div
            class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-0"
            id="book-images"
          >
            <BookCoverForm
              initialUrl={book.coverUrl ?? null}
              book={book}
              user={user}
            />
            <hr class="my-4 md:hidden" />
            <BookGalleryForm
              initialImages={
                book.images?.map((image: { id: string; imageUrl: string }) => ({
                  id: image.id,
                  url: image.imageUrl,
                })) ?? []
              }
              book={book}
              user={user}
            />
          </div>
          <hr class="my-4" />
          <BookForm
            action={`/dashboard/books/${bookId}`}
            bookId={book.id}
            formValues={formValues}
            isPublisher={isPublisher}
          />
        </Page>
      </AppLayout>,
    );
  },
);

export const POST = createRoute(
  paramValidator(bookIdSchema),
  formValidator(bookFormSchema),
  requireBookEditAccess,
  async (c: BookFormWithBookContext) => {
    const formData = c.req.valid("form");
    const book = c.get("book");

    const bookData = buildUpdateBookData(formData);
    const updatedBook = await updateBook(bookData, book.id);

    if (!updatedBook) {
      return showErrorAlert(c, "Failed to update book");
    }

    return showSuccessAlert(c, `${updatedBook.title} updated!`);
  },
);

export const PATCH = createRoute(
  paramValidator(bookIdSchema),
  requireBookPublishIntentAccess,
  async (c: BookFormWithBookContext) => {
    const form = await c.req.parseBody();
    const intent = form.intent;
    const book = c.get("book");
    const user = await getUser(c);
    if (!book) return showErrorAlert(c, "Book not found");
    if (!book.artist) return showErrorAlert(c, "Artist not found");

    if (intent === "publish") {
      const result = await updateBookPublicationStatus(book.id, "published");
      if (!result.success) return showErrorAlert(c, result.error, 400);
      const updatedBook = result.book;

      await createBookPublishedNotification(user, book);

      return c.html(
        <>
          <Alert
            type="success"
            message={`${updatedBook?.title ?? "Book"} Published!`}
          />
          <PublishToggleForm book={updatedBook} user={user} />
          <PreviewButton book={updatedBook} user={user} />
        </>,
      );
    }

    if (intent === "unpublish") {
      const result = await updateBookPublicationStatus(book.id, "draft");
      if (!result.success) {
        return c.html(
          <>
            <Alert type="danger" message={result.error} />
            <PublishToggleForm book={book} user={user} />
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
          <PublishToggleForm book={updatedBook} user={user} />
          <PreviewButton book={updatedBook} user={user} />
        </>,
      );
    }
  },
);

export const DELETE = createRoute(
  paramValidator(bookIdSchema),
  requireBookDeleteAccess,
  async (c: BookIdContext) => {
    const bookId = c.req.valid("param").bookId;
    const user = await getUser(c);

    if (!user.creator) return showErrorAlert(c, "No Creator Profile Found");

    const deletedBook = await deleteBookById(bookId);

    if (!deletedBook) {
      return showErrorAlert(c, "Failed to delete book");
    }

    return c.html(
      <>
        <Alert type="success" message={`${deletedBook.title} deleted!`} />
        {dispatchEvents(["books:updated"])}
      </>,
    );
  },
);
