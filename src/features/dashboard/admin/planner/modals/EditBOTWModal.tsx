import BookOfTheWeekForm from "../forms/BookOfTheWeekForm";
import Modal from "../../../../../components/app/Modal";
import { Book, BookOfTheWeek, Creator } from "../../../../../db/schema";
import { toWeekString } from "../../../../../lib/utils";

type Props = {
  book: Book & {
    artist: Creator | null;
    publisher: Creator | null;
    bookOfTheWeekEntry: BookOfTheWeek | null;
  };
  formValues?: {
    weekStart: string;
    text: string;
  };
};

const EditBOTWModal = ({ book }: Props) => {
  const formValues = {
    weekStart: book.bookOfTheWeekEntry?.weekStart
      ? toWeekString(book.bookOfTheWeekEntry?.weekStart)
      : "",
    text: book.bookOfTheWeekEntry?.text ?? "",
  };

  return (
    <Modal title={`Edit ${book.title}`}>
      <BookOfTheWeekForm book={book} formValues={formValues} />
    </Modal>
  );
};

export default EditBOTWModal;
