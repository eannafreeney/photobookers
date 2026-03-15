import CardCreatorCard from "./CardCreatorCard";
import { BookCardResult } from "../../constants/queries";

type Props = {
  book: BookCardResult;
  currentCreatorId?: string | null;
  showPublisherInsteadOfArtist?: boolean;
};

const BookCreators = ({
  book,
  currentCreatorId,
  showPublisherInsteadOfArtist = false,
}: Props) => {
  const showArtist =
    !showPublisherInsteadOfArtist &&
    (!currentCreatorId || currentCreatorId !== book.artistId);
  const showPublisher =
    showPublisherInsteadOfArtist &&
    (!currentCreatorId || currentCreatorId !== book.publisherId);
  return (
    <div class="flex items-center justify-between gap-2 book-creators">
      {showArtist && (
        <CardCreatorCard
          creator={book.artist ?? null}
          maxDisplayNameLength={20}
        />
      )}
      {showPublisher && (
        <CardCreatorCard
          creator={book.publisher ?? null}
          maxDisplayNameLength={20}
        />
      )}
    </div>
  );
};
export default BookCreators;
