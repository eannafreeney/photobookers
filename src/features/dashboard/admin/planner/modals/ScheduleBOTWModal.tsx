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

const ScheduleBOTWModal = ({ book, formValues }: Props) => {
  return (
    <Modal title="Schedule Book of the Week">
      Book Of Trh qwwk
      {/* <BookOfTheWeekForm book={book} formValues={initialFormValues} /> */}
    </Modal>
  );
};

export default ScheduleBOTWModal;
