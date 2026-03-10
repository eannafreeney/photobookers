import Modal from "../../../../../components/app/Modal";
import { toWeekString } from "../../../../../lib/utils";
import FeaturedBooksForm from "../forms/FeaturedBooksForm";
import { FeaturedBookOfTheWeekWithBook, getAllBooksPreview } from "../services";

type Props = {
  featuredBooks: FeaturedBookOfTheWeekWithBook[];
  week: string;
};

const EditFeaturedBooksModal = async ({ featuredBooks, week }: Props) => {
  if (featuredBooks.length === 0) {
    return <div>No featured books found</div>;
  }

  const allBooks = await getAllBooksPreview();
  const options = allBooks.map((book) => ({
    id: book.id,
    label: `${book.title} - ${book.artist?.displayName}${book.publisher ? ` - ${book.publisher?.displayName}` : ""}`,
    img: book?.coverUrl ?? null,
    description: book?.description,
  }));

  return (
    <Modal title="Edit featured books">
      <FeaturedBooksForm
        featuredBooks={featuredBooks}
        week={week}
        options={options}
        isEditMode
      />
    </Modal>
  );
};
export default EditFeaturedBooksModal;
