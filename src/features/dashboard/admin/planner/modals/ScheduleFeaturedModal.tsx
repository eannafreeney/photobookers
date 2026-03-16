import Modal from "../../../../../components/app/Modal";
import FeaturedBooksForm from "../forms/FeaturedBooksForm";
import { getAllBooksPreviewForFeatured } from "../services";

type Props = {
  week: string;
  formValues?: {
    bookId1: string;
    bookId2: string;
    bookId3: string;
    bookId4: string;
    bookId5: string;
  };
};

const ScheduleFeaturedModal = async ({ week, formValues }: Props) => {
  const allBooks = await getAllBooksPreviewForFeatured();
  const options = allBooks.map((book) => ({
    id: book.id,
    label: `${book.title} - ${book.artist?.displayName}${book.publisher ? ` - ${book.publisher?.displayName}` : ""}`,
    img: book?.coverUrl ?? null,
  }));

  return (
    <Modal title={`Featured books for ${week}`}>
      <FeaturedBooksForm
        week={week}
        options={options}
        formValues={formValues}
      />
    </Modal>
  );
};

export default ScheduleFeaturedModal;
