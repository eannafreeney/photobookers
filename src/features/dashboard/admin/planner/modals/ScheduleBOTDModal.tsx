import Modal from "../../../../../components/app/Modal";
import BookOfTheDayForm from "../forms/BookOfTheDayForm";
import { getAllBooksForBOTD, getAllBooksPreview } from "../services";

type Props = {
  date: string;
  formValues?: {
    date: string;
    bookId: string;
  };
};

const ScheduleBOTDModal = async ({ date, formValues }: Props) => {
  const allBooks = await getAllBooksForBOTD();
  const options = allBooks.map((book) => ({
    id: book.id,
    label: `${book.title} - ${book.artist?.displayName} ${book.publisher ? `- ${book.publisher?.displayName}` : ""}`,
    img: book?.coverUrl ?? null,
  }));

  return (
    <Modal title="Schedule Book of the Day">
      <BookOfTheDayForm options={options} date={date} formValues={formValues} />
    </Modal>
  );
};

export default ScheduleBOTDModal;
