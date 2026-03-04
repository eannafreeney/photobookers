import BookOfTheWeekForm from "../forms/BookOfTheWeekForm";
import Modal from "../../../../../components/app/Modal";
import { Book, Creator } from "../../../../../db/schema";

type Props = {
  book: Book & { artist: Creator | null; publisher: Creator | null };
  formValues?: {
    weekStart: string;
    text: string;
  };
};

const BOTWModal = ({ book, formValues }: Props) => {
  const defaultFormValues = {
    weekStart: "",
    text: book.description ?? "",
  };
  const initialFormValues = formValues ?? defaultFormValues;

  return (
    <Modal title="Schedule Book of the Week">
      <BookOfTheWeekForm book={book} formValues={initialFormValues} />
    </Modal>
  );
};

export default BOTWModal;
