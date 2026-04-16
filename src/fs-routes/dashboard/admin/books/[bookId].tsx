import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { bookIdSchema } from "../../../../schemas";
import { formValidator, paramValidator } from "../../../../lib/validator";
import { getFlash, getUser } from "../../../../utils";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import Breadcrumbs from "../../../../features/dashboard/admin/components/Breadcrumbs";
import InfoPage from "../../../../pages/InfoPage";
import {
  buildUpdateBookData,
  getBookById,
  updateBook,
} from "../../../../features/dashboard/books/services";
import PublishToggleForm from "../../../../features/dashboard/books/components/PublishToggleForm";
import { BookFormAdmin } from "../../../../features/dashboard/admin/books/forms/BookForm";
import PreviewButton from "../../../../features/api/components/PreviewButton";
import BookCoverForm from "../../../../features/dashboard/images/forms/BookCoverForm";
import BookGalleryForm from "../../../../features/dashboard/images/forms/BookGalleryForm";
import { bookFormAdminSchema } from "../../../../features/dashboard/admin/books/schema";
import { showErrorAlert, showSuccessAlert } from "../../../../lib/alertHelpers";
import { BookFormWithBookIdContext } from "../../../../features/dashboard/admin/books/types";
import { resolvePublisher } from "../../../../features/dashboard/admin/creators/services";
import { resolveArtist } from "../../../../features/dashboard/admin/creators/services";
import { deleteBookByIdAdmin } from "../../../../features/dashboard/admin/books/services";
import { BookIdContext } from "../../../../features/dashboard/books/types";
import Alert from "../../../../components/app/Alert";
import { dispatchEvents } from "../../../../lib/disatchEvents";
import BookApprovalForm from "../../../../features/dashboard/admin/books/forms/BookApprovalForm";

export const GET = createRoute(
  paramValidator(bookIdSchema),
  async (c: Context) => {
    const user = await getUser(c);
    const bookId = c.req.param("bookId");
    const flash = await getFlash(c);
    const currentPath = c.req.path;

    const [error, book] = await getBookById(bookId);
    if (error)
      return c.html(<InfoPage errorMessage={error.reason} user={user} />);

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
              { label: "Admin Books Overview", href: "/dashboard/admin/books" },
              {
                label: `Edit "${book.title}"`,
              },
            ]}
          />
          <div class="flex justify-end">
            <div class="flex items-center gap-4">
              <BookApprovalForm book={book} />
              <PublishToggleForm book={book} user={user} />
              <PreviewButton book={book} user={user} />
            </div>
          </div>
          <BookFormAdmin bookId={book.id} formValues={formValues} />
          <hr class="my-4" />
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
        </Page>
      </AppLayout>,
    );
  },
);

export const POST = createRoute(
  formValidator(bookFormAdminSchema),
  paramValidator(bookIdSchema),
  async (c: BookFormWithBookIdContext) => {
    const formData = c.req.valid("form");
    const user = await getUser(c);
    const bookId = c.req.valid("param").bookId;
    const book = await getBookById(bookId);
    if (!book) return showErrorAlert(c, "Book not found");

    const [artistError, artist] = await resolveArtist(formData, user.id);
    const [publisherError, publisher] = await resolvePublisher(formData, user);

    if (artistError) return showErrorAlert(c, artistError.reason);
    if (publisherError) return showErrorAlert(c, publisherError.reason);

    const bookData = buildUpdateBookData(
      formData,
      artist.id,
      publisher?.id ?? null,
    );
    const [error, updatedBook] = await updateBook(bookData, bookId);
    if (error) return showErrorAlert(c, error.reason);

    return showSuccessAlert(c, `${updatedBook.title} updated!`);
  },
);

export const DELETE = createRoute(
  paramValidator(bookIdSchema),
  async (c: BookIdContext) => {
    const bookId = c.req.valid("param").bookId;

    const [error, deletedBook] = await deleteBookByIdAdmin(bookId);
    if (error) return showErrorAlert(c, error.reason);

    return c.html(
      <>
        <Alert type="success" message={`${deletedBook.title} deleted!`} />,
        {dispatchEvents(["books:updated"])}
      </>,
    );
  },
);
