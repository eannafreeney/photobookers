import { Context } from "hono";
import { getFlash, getUser, setFlash } from "../../../utils";
import { getIsMobile } from "../../../lib/device";
import BooksOverview from "../../../pages/dashboard/BooksOverview";
import AddBookPage from "../../../pages/dashboard/AddBookPage";
import { resolveArtist, resolvePublisher } from "../../../services/creators";
import { showErrorAlert, showSuccessAlert } from "../../../lib/alertHelpers";
import Alert from "../../../components/app/Alert";
import BookEditPage from "../../../pages/dashboard/BookEditPage";
import {
  BookFormContext,
  BookFormWithBookContext,
  BookIdContext,
} from "./types";
import { BooksOverviewTable } from "../../../components/dashboard/BooksOverviewTable";
import PublishToggleForm from "../../../components/cms/forms/PublishToggleForm";
import PreviewButton from "../../../components/api/PreviewButton";
import BooksForApprovalTable from "../../../components/cms/ui/BooksForApprovalTable";
import {
  approveBookById,
  createBook,
  rejectBookById,
  updateBook,
  deleteBookById,
  prepareBookData,
  prepareBookUpdateData,
  updateBookPublicationStatus,
} from "./services";

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
  return c.html(<AddBookPage user={user} />);
};

export const createBookAsPublisher = async (c: BookFormContext) => {
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

  if (!newBook) return showErrorAlert(c, "Failed to create book");

  await setFlash(c, "success", `${newBook.title} created!`);
  return c.redirect(`/dashboard/books/edit/${newBook.id}`);
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
};

export const getEditBookPage = async (c: BookIdContext) => {
  const bookId = c.req.valid("param").bookId;
  const user = await getUser(c);
  const flash = await getFlash(c);

  return c.html(<BookEditPage user={user} bookId={bookId} flash={flash} />);
};

export const updateBookAsPublisher = async (c: BookFormWithBookContext) => {
  const formData = c.req.valid("form");
  const book = c.get("book");

  const bookData = prepareBookUpdateData(formData);
  const updatedBook = await updateBook(bookData, book.id);

  if (!updatedBook) return showErrorAlert(c, "Failed to update book");

  return showSuccessAlert(c, `${updatedBook.title} updated!`);
};

export const updateBookAsArtist = async (c: BookFormWithBookContext) => {
  const formData = c.req.valid("form");
  const book = c.get("book");

  const bookData = prepareBookUpdateData(formData);
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

  const result = await updateBookPublicationStatus(book.id, "published");

  if (!result.success) return showErrorAlert(c, result.error, 400);

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
};

export const makeBookDraft = async (c: BookFormWithBookContext) => {
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
};

export const approveBook = async (c: BookIdContext) => {
  const bookId = c.req.valid("param").bookId;
  const user = await getUser(c);

  if (!user.creator) return showErrorAlert(c, "No Creator Profile Found");

  const updatedBook = await approveBookById(bookId);

  if (!updatedBook) return showErrorAlert(c, "Failed to approve book");

  return c.html(
    <>
      <Alert type="success" message="Book Approved!" />
      <BooksForApprovalTable creatorId={user.creator.id} />
    </>,
  );
};

export const rejectBook = async (c: BookIdContext) => {
  const bookId = c.req.valid("param").bookId;
  const user = await getUser(c);

  if (!user.creator) return showErrorAlert(c, "No Creator Profile Found");

  const updatedBook = await rejectBookById(bookId);

  if (!updatedBook) return showErrorAlert(c, "Failed to reject book");

  return c.html(
    <>
      <Alert type="success" message="Book Rejected!" />
      <BooksForApprovalTable creatorId={user.creator.id} />
    </>,
  );
};
