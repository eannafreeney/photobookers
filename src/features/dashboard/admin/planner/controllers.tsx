import { Context } from "hono";
import { getUser } from "../../../../utils";
import PlannerPage from "./pages/PlannerPage";
import { getWeekStarts } from "./utils";
import {
  deleteBookOfTheWeekByIdAdmin,
  getBotwByWeekStart,
  setBookOfTheWeek,
  updateBookOfTheWeek,
} from "./services";
import { BOTWBookIdContext, BOTWFormWithBookIdContext } from "./types";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import { getBookById } from "../../books/services";
import EditBOTWModal from "./modals/EditBOTWModal";
import Alert from "../../../../components/app/Alert";
import ScheduleBOTWModal from "./modals/ScheduleBOTWModal";
import ScheduleBOTWContent from "./components/ScheduleBOTWContent";

const updatePlanner = () => (
  <div id="server_events">
    <div x-init="$dispatch('planner:updated')"></div>
  </div>
);

export const getPlannerPageAdmin = async (c: Context) => {
  const user = await getUser(c);
  const year = Number(c.req.query("year") ?? new Date().getFullYear());
  const weekStarts = getWeekStarts(year);
  const currentPath = c.req.path;
  const botwByWeekStart = await getBotwByWeekStart(year);

  return c.html(
    <PlannerPage
      user={user}
      year={year}
      weekStarts={weekStarts}
      currentPath={currentPath}
      botwByWeekStart={botwByWeekStart}
    />,
  );
};

// ---------- BOOK OF THE WEEK  ----------

export const getScheduleBOTWModal = async (c: BOTWBookIdContext) => {
  const week = c.req.query("week") ?? "";
  return c.html(<ScheduleBOTWModal week={week} />);
};

export const getScheduleBOTWModalContent = async (c: Context) => {
  const week = c.req.query("week") ?? "";
  return c.html(<ScheduleBOTWContent week={week} />);
};

export const getEditBOTWModalAdmin = async (c: BOTWBookIdContext) => {
  const book = await getBookById(c.req.valid("param").bookId);
  if (!book) return showErrorAlert(c, "Book not found");

  return c.html(<EditBOTWModal book={book} />);
};

export const setBOTWAdmin = async (c: BOTWFormWithBookIdContext) => {
  const formData = c.req.valid("form");
  const bookId = formData.bookId;
  const weekStart = formData.weekStart;

  try {
    const bookOfTheWeek = await setBookOfTheWeek({
      weekStart,
      bookId,
    });
    if (!bookOfTheWeek) {
      return showErrorAlert(c, "Failed to set book of the week");
    }
  } catch (error) {
    return showErrorAlert(c, "Failed to set book of the week");
  }

  return c.html(
    <>
      <Alert type="success" message="Book of the Week set!" />
      {updatePlanner()}
    </>,
  );
};

export const updateBOTWAdmin = async (c: BOTWFormWithBookIdContext) => {
  const formData = c.req.valid("form");
  const bookId = formData.bookId;
  const weekStart = formData.weekStart;
  const text = formData.text;

  const bookOfTheWeek = await updateBookOfTheWeek({
    weekStart,
    bookId,
    text: text ?? "",
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
      {updatePlanner()}
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
      {updatePlanner()}
    </>,
  );
};
