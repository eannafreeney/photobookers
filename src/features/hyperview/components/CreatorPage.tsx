import { BookCardResult } from "../../../constants/queries";
import { Creator } from "../../../db/schema";
import BookCard from "./BookCard";

type Props = {
  books: BookCardResult[];
  creator: Creator | null;
  baseUrl: string;
  likesByBookId: Record<string, boolean>;
};

const CreatorPage = ({ books, creator, baseUrl, likesByBookId }: Props) => {
  return (
    <view xmlns="https://hyperview.org/hyperview">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          baseUrl={baseUrl}
          currentCreatorId={creator?.id}
          isLiked={likesByBookId[book.id] ?? false}
        />
      ))}
    </view>
  );
};

export default CreatorPage;
