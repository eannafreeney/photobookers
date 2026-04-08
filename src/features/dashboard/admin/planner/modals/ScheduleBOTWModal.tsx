import Button from "../../../../../components/app/Button";
import Modal from "../../../../../components/app/Modal";
import OptionsComboBox from "../../../../../components/app/OptionsComboBox";
import FormButtons from "../../../../../components/forms/FormButtons";
import BookOfTheWeekForm from "../forms/BookOfTheWeekForm";
import { getAllBooksPreview } from "../services";

type Props = {
  week: string;
  formValues?: {
    weekStart: string;
    bookId: string;
  };
};

const ScheduleBOTWModal = async ({ week, formValues }: Props) => {
  const allBooks = await getAllBooksPreview();
  const options = allBooks.map((book) => ({
    id: book.id,
    label: `${book.title} - ${book.artist?.displayName} ${book.publisher ? `- ${book.publisher?.displayName}` : ""}`,
    img: book?.coverUrl ?? null,
  }));

  return (
    <Modal title="Schedule Book of the Week">
      <BookOfTheWeekForm
        options={options}
        week={week}
        formValues={formValues}
      />
    </Modal>
  );
};

export default ScheduleBOTWModal;
