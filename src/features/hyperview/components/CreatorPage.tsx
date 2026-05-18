import { BookCardResult } from "../../../constants/queries";
import { BookWithGalleryImages } from "../../app/types";
import { Creator } from "../../../db/schema";
import { User } from "../../../db/schema";
import BookCard from "./BookCard";
import { AuthUser } from "../../../../types";

type Props = {
  books: BookWithGalleryImages[];
  creator: Creator | null;
  baseUrl: string;
  user: AuthUser;
  likesByBookId: Record<string, boolean>;
};

const CreatorPage = ({
  books,
  creator,
  baseUrl,
  user,
  likesByBookId,
}: Props) => {
  return (
    <view xmlns="https://hyperview.org/hyperview">
      {books.map((book: BookCardResult) => (
        <BookCard
          key={book.id}
          book={book}
          baseUrl={baseUrl}
          currentCreatorId={creator?.id}
          user={user}
          isLiked={likesByBookId[book.id] ?? false}
        />
      ))}
    </view>
  );
};

export default CreatorPage;
