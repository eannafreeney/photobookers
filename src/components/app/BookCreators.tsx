import CardCreatorCard from "./CardCreatorCard";
import { BookCardResult } from "../../constants/queries";

type Props = {
  book: BookCardResult;
  currentCreatorId?: string | null;
};

const BookCreators = ({ book, currentCreatorId }: Props) => {
  return (
    <div class="flex items-center justify-between gap-2">
      <CardCreatorCard creator={book.artist ?? null} />
      {(!currentCreatorId || currentCreatorId !== book.publisherId) && (
        <CardCreatorCard creator={book.publisher ?? null} />
      )}
    </div>
  );
};
export default BookCreators;
