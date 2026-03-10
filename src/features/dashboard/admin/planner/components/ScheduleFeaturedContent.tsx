import { getAllBooksPreview } from "../services";
import FeaturedBooksForm from "../forms/FeaturedBooksForm";

const ScheduleFeaturedContent = async ({ week }: { week: string }) => {
  const allBooks = await getAllBooksPreview();
  const options = allBooks.map((book) => ({
    id: book.id,
    label: `${book.title} - ${book.artist?.displayName}${book.publisher ? ` - ${book.publisher?.displayName}` : ""}`,
    img: book?.coverUrl ?? null,
    description: book?.description,
  }));

  return (
    <div id="featured-set-modal-content" class="flex flex-col gap-4">
      <FeaturedBooksForm week={week} options={options} />
    </div>
  );
};
export default ScheduleFeaturedContent;
