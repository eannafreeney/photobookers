import CardCreatorCard from "./CardCreatorCard";
import { BookCardResult } from "../../constants/queries";

type Props = {
  book: BookCardResult;
  currentCreatorId?: string | null;
  showPublisher?: boolean;
};

const BookCreators = ({
  book,
  currentCreatorId,
  showPublisher = false,
}: Props) => {
  return (
    <div class="flex items-center justify-between gap-2">
      {(!currentCreatorId || currentCreatorId !== book.publisherId) && (
        <CardCreatorCard creator={book.artist ?? null} />
      )}
      {showPublisher &&
        (!currentCreatorId || currentCreatorId !== book.publisherId) && (
          <CardCreatorCard creator={book.publisher ?? null} />
        )}
    </div>
  );
};
export default BookCreators;
