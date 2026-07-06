import { jsx } from "hono/jsx/jsx-runtime";
import Modal from "../../../../../components/app/Modal.js";
import BookOfTheDayForm from "../forms/BookOfTheDayForm.js";
import { getAllBooksForBOTD } from "../services.js";
const ScheduleBOTDModal = async ({ date, formValues }) => {
  const allBooks = await getAllBooksForBOTD();
  const options = allBooks.map((book) => ({
    id: book.id,
    label: `${book.title} - ${book.artist?.displayName} ${book.publisher ? `- ${book.publisher?.displayName}` : ""}`,
    img: book?.coverUrl ?? null
  }));
  return /* @__PURE__ */ jsx(Modal, { title: "Schedule Book of the Day", children: /* @__PURE__ */ jsx(BookOfTheDayForm, { options, date, formValues }) });
};
var ScheduleBOTDModal_default = ScheduleBOTDModal;
export {
  ScheduleBOTDModal_default as default
};
