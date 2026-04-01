import { Context } from "hono";
import AdminBooksOverviewPage from "./pages/AdminBooksOverviewPage";
import { getFlash, getUser, setFlash } from "../../../../utils";
import AddBookPage from "./pages/AddBookPage";
import { showErrorAlert, showSuccessAlert } from "../../../../lib/alertHelpers";
import Alert from "../../../../components/app/Alert";
import { BookFormContext, BookFormWithBookIdContext } from "./types";
import {
  createBook,
  buildCreateBookData,
  buildUpdateBookData,
  updateBook,
} from "../../books/services";
import EditBookPageAdmin from "./pages/EditBookPageAdmin";
import { BookIdContext } from "../../books/types";
import { deleteBookByIdAdmin } from "./services";
import { getBookById } from "../../books/services";
import { resolveArtist, resolvePublisher } from "../creators/services";
import AdminBooksTableAndFilter from "./components/AdminBooksTableAndFilter";

export const getBooksOverviewPageAdmin = async (c: Context) => {
  const user = await getUser(c);
  const searchQuery = c.req.query("search");
  const flash = await getFlash(c);
  const currentPage = Number(c.req.query("page") ?? 1);
  const currentPath = c.req.path;

  return c.html(
    <AdminBooksOverviewPage
      user={user}
      flash={flash}
      searchQuery={searchQuery}
      currentPage={currentPage}
      currentPath={currentPath}
    />,
  );
};

export const getBooksTableFilter = async (c: Context) => {
  const rawStatus = c.req.query("status");
  const status =
    rawStatus === "approved" ||
    rawStatus === "pending" ||
    rawStatus === "rejected"
      ? rawStatus
      : undefined;
  const currentPage = Number(c.req.query("page") ?? 1);
  const currentPath = c.req.path;
  const searchQuery = c.req.query("search");
  const user = await getUser(c);

  return c.html(
    <AdminBooksTableAndFilter
      user={user}
      status={status}
      currentPage={currentPage}
      searchQuery={searchQuery}
      currentPath={currentPath}
    />,
  );
};

export const getAddBookPageAdmin = async (c: Context) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  return c.html(<AddBookPage user={user} currentPath={currentPath} />);
};

export const createNewBookAdmin = async (c: BookFormContext) => {
  const user = await getUser(c);
  const formData = c.req.valid("form");

  const [artistError, artist] = await resolveArtist(formData, user.id);
  const [publisherError, publisher] = await resolvePublisher(formData, user);

  if (artistError) return showErrorAlert(c, artistError.reason);
  if (publisherError) return showErrorAlert(c, publisherError.reason);

  const bookData = await buildCreateBookData(
    formData,
    artist,
    user.id,
    publisher,
  );
  const newBook = await createBook(bookData);

  if (!newBook) {
    return c.html(<Alert type="danger" message="Failed to create book" />, 422);
  }

  await setFlash(c, "success", `${newBook.title} created!`);
  return c.redirect(`/dashboard/admin/books/${newBook.id}/update`);
};

export const getEditBookPageAdmin = async (c: Context) => {
  const user = await getUser(c);
  const bookId = c.req.param("bookId");
  const flash = await getFlash(c);
  const currentPath = c.req.path;

  return c.html(
    <EditBookPageAdmin
      bookId={bookId}
      user={user}
      flash={flash}
      currentPath={currentPath}
    />,
  );
};

export const updateBookAdmin = async (c: BookFormWithBookIdContext) => {
  const formData = c.req.valid("form");
  const user = await getUser(c);
  const bookId = c.req.valid("param").bookId;
  const book = await getBookById(bookId);
  if (!book) {
    return showErrorAlert(c, "Book not found");
  }

  const [artistError, artist] = await resolveArtist(formData, user.id);
  const [publisherError, publisher] = await resolvePublisher(formData, user);

  if (artistError) return showErrorAlert(c, artistError.reason);
  if (publisherError) return showErrorAlert(c, publisherError.reason);

  const bookData = buildUpdateBookData(formData, artist.id, publisher.id);
  const updatedBook = await updateBook(bookData, bookId);
  if (!updatedBook) {
    return showErrorAlert(c, "Failed to update book");
  }

  return showSuccessAlert(c, `${updatedBook.title} updated!`);
};

export const deleteBookAdmin = async (c: BookIdContext) => {
  const bookId = c.req.valid("param").bookId;
  const book = await getBookById(bookId);
  if (!book) {
    return showErrorAlert(c, "Book not found");
  }

  const deletedBook = await deleteBookByIdAdmin(bookId);

  if (!deletedBook) {
    return showErrorAlert(c, "Failed to delete book");
  }
  return c.html(
    <>
      <div id="server_events">
        <div x-init="$dispatch('books:updated')"></div>
      </div>
      <Alert type="success" message={`${deletedBook.title} deleted!`} />,
    </>,
  );
};
