import Alert from "../../../../components/app/Alert";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import { getBookById } from "../../../app/services";
import BOTWModal from "./modals/BOTWModal";
import EditBOTWModal from "./modals/EditBOTWModal";
import {
  deleteBookOfTheWeekByIdAdmin,
  setBookOfTheWeek,
  updateBookOfTheWeek,
} from "./services";
import { BOTWBookIdContext, BOTWFormWithBookIdContext } from "./types";

export const getBOTWModalAdmin = async (c: BOTWBookIdContext) => {
  const bookId = c.req.valid("param").bookId;
  const book = await getBookById(bookId);
  if (!book) return showErrorAlert(c, "Book not found");
  return c.html(<BOTWModal book={book} />);
};

export const getEditBOTWModalAdmin = async (c: BOTWBookIdContext) => {
  const book = await getBookById(c.req.valid("param").bookId);
  if (!book) return showErrorAlert(c, "Book not found");

  return c.html(<EditBOTWModal book={book} />);
};

export const setBOTWAdmin = async (c: BOTWFormWithBookIdContext) => {
  const formData = c.req.valid("form");
  const bookId = c.req.valid("param").bookId;

  const bookOfTheWeek = await setBookOfTheWeek({
    weekStart: formData.weekStart,
    bookId: bookId,
    text: formData.text,
  });

  const book = await getBookById(bookId);
  if (!book) return showErrorAlert(c, "Book not found");

  if (!bookOfTheWeek) {
    return c.html(
      <div id="book-of-the-week-errors" class="text-danger text-xs my-2">
        That week already has a book assigned, or this book is already chosen
        for another week.
      </div>,
      422,
    );
  }

  return c.html(
    <>
      <Alert type="success" message="Book of the Week set!" />
      <div id="server_events">
        <div x-init="$dispatch('books:updated')"></div>
      </div>
    </>,
  );
};

export const updateBOTWAdmin = async (c: BOTWFormWithBookIdContext) => {
  const formData = c.req.valid("form");
  const bookId = c.req.valid("param").bookId;

  const bookOfTheWeek = await updateBookOfTheWeek({
    weekStart: formData.weekStart,
    bookId: bookId,
    text: formData.text,
  });

  const book = await getBookById(bookId);
  if (!book) return showErrorAlert(c, "Book not found");

  if (!bookOfTheWeek) {
    return c.html(
      <div id="book-of-the-week-errors" class="text-danger text-xs my-2">
        That week already has a book assigned, or this book is already chosen
        for another week.
      </div>,
      422,
    );
  }

  return c.html(
    <>
      <Alert type="success" message="Book of the Week edited!" />
      <div id="server_events">
        <div x-init="$dispatch('books:updated')"></div>
      </div>
    </>,
  );
};

export const deleteBOTWAdmin = async (c: BOTWBookIdContext) => {
  const bookId = c.req.valid("param").bookId;
  const book = await getBookById(bookId);
  if (!book) return showErrorAlert(c, "Book not found");
  const deletedBookOfTheWeek = await deleteBookOfTheWeekByIdAdmin(bookId);
  if (!deletedBookOfTheWeek)
    return showErrorAlert(c, "Failed to delete book of the week");
  return c.html(
    <>
      <Alert type="success" message="Book of the Week deleted!" />
      <div id="server_events">
        <div x-init="$dispatch('books:updated')"></div>
      </div>
    </>,
  );
};
