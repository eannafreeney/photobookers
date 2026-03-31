import { Context } from "hono";
import { getFlash, getUser, setFlash } from "../../../utils";
import { getIsMobile } from "../../../lib/device";
import BooksOverview from "./pages/BooksOverview";
import AddBookPage from "./pages/AddBookPage";
import { showErrorAlert, showSuccessAlert } from "../../../lib/alertHelpers";
import Alert from "../../../components/app/Alert";
import BookEditPage from "./pages/EditBookPage";
import {
  BookFormContext,
  BookFormWithBookContext,
  BookIdContext,
} from "./types";
import PublishToggleForm from "./components/PublishToggleForm";
import PreviewButton from "../../../features/api/components/PreviewButton";
import {
  createBook,
  updateBook,
  deleteBookById,
  buildCreateBookData,
  buildUpdateBookData,
  updateBookPublicationStatus,
} from "./services";
import { resolveArtist, resolvePublisher } from "../admin/creators/services";
import { sendAdminEmail } from "../../../lib/sendEmail";
import { generateBookNotificationEmail } from "./emails";
import { supabaseAdmin } from "../../../lib/supabase";

export const getBooksOverview = async (c: Context) => {
  const searchQuery = c.req.query("search");
  const user = await getUser(c);
  const flash = await getFlash(c);
  const isMobile = getIsMobile(c.req.header("user-agent") ?? "");
  const currentPage = parseInt(c.req.query("page") ?? "1");
  const currentPath = c.req.path;

  return c.html(
    <BooksOverview
      searchQuery={searchQuery}
      user={user}
      flash={flash}
      currentPath={currentPath}
      isMobile={isMobile}
      currentPage={currentPage}
    />,
  );
};

export const getAddBookPage = async (c: Context) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  return c.html(<AddBookPage user={user} currentPath={currentPath} />);
};

export const createBookAsPublisher = async (c: BookFormContext) => {
  const user = await getUser(c);
  const formData = c.req.valid("form");
  if (!user.creator) return showErrorAlert(c, "No Creator Profile Found");

  const artist = await resolveArtist(formData, user.id);

  if (artist === "error" || !artist) {
    return showErrorAlert(c, "Invalid artist");
  }

  const bookData = await buildCreateBookData(
    formData,
    artist,
    user.id,
    user.creator,
  );
  const newBook = await createBook(bookData);
  if (!newBook) return showErrorAlert(c, "Failed to create book");

  await setFlash(c, "success", `${newBook.title} created!`);
  return c.redirect(`/dashboard/books/${newBook.id}/update`);
};

export const createBookAsArtist = async (c: BookFormContext) => {
  const user = await getUser(c);
  const formData = c.req.valid("form");

  if (!user.creator) {
    return showErrorAlert(c, "No Creator Profile Found");
  }

  const publisher = await resolvePublisher(formData, user.id);

  if (publisher === "error") {
    return showErrorAlert(c, "Invalid publisher");
  }

  const bookData = await buildCreateBookData(
    formData,
    user.creator,
    user.id,
    publisher,
  );

  const newBook = await createBook(bookData);
  if (!newBook) return showErrorAlert(c, "Failed to create book");

  await setFlash(c, "success", `Successfully created "${newBook.title}"!`);
  return c.redirect(`/dashboard/books/${newBook.id}/update`);
};

export const getEditBookPage = async (c: BookIdContext) => {
  const bookId = c.req.valid("param").bookId;
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;

  return c.html(
    <BookEditPage
      user={user}
      bookId={bookId}
      flash={flash}
      currentPath={currentPath}
    />,
  );
};

export const updateBookDetails = async (c: BookFormWithBookContext) => {
  const formData = c.req.valid("form");
  const book = c.get("book");

  const bookData = buildUpdateBookData(formData);
  const updatedBook = await updateBook(bookData, book.id);

  if (!updatedBook) {
    return showErrorAlert(c, "Failed to update book");
  }

  return showSuccessAlert(c, `${updatedBook.title} updated!`);
};

export const deleteBook = async (c: BookIdContext) => {
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
      <div id="server_events">
        <div x-init="$dispatch('books:updated')"></div>
      </div>
    </>,
  );
};

export const makeBookPublic = async (c: BookFormWithBookContext) => {
  const book = c.get("book");
  const user = await getUser(c);

  if (!book) return showErrorAlert(c, "Book not found");
  if (!book.artist) return showErrorAlert(c, "Artist not found");

  const result = await updateBookPublicationStatus(book.id, "published");

  if (!result.success) return showErrorAlert(c, result.error, 400);

  const updatedBook = result.book;

  await sendAdminEmail(
    "New book created",
    generateBookNotificationEmail(updatedBook, book.artist),
  );

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
};

export const makeBookDraft = async (c: BookFormWithBookContext) => {
  const book = c.get("book");
  const user = await getUser(c);

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
};
