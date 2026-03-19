import { AuthUser } from "../../../../types";
import BookCard from "../../../components/app/BookCard";
import GridPanel from "../../../components/app/GridPanel";
import SectionTitle from "../../../components/app/SectionTitle";
import { BookCardResult } from "../../../constants/queries";
import { getRelatedBooks } from "../services";

type RelatedBooksProps = {
  book: BookCardResult;
  user: AuthUser | null;
};

const RelatedBooks = async ({ book, user }: RelatedBooksProps) => {
  const relatedBooks = await getRelatedBooks(book.id, {
    artistId: book.artistId,
    publisherId: book.publisherId,
    tags: book.tags ?? [],
  });

  if (relatedBooks.length === 0) return <></>;

  return (
    <div class="flex flex-col gap-4">
      <SectionTitle className="mb-2">You might also like</SectionTitle>
      <GridPanel>
        {relatedBooks.map((b) => (
          <BookCard book={b} user={user} />
        ))}
      </GridPanel>
    </div>
  );
};

export default RelatedBooks;
