import { AuthUser } from "../../../../types";
import BookCard from "../../../components/app/BookCard";
import GridPanel from "../../../components/app/GridPanel";
import SectionTitle from "../../../components/app/SectionTitle";
import { BookCardResult } from "../../../constants/queries";
import InfoPage from "../../../pages/InfoPage";
import { getRelatedBooks } from "../services";

type RelatedBooksProps = {
  book: BookCardResult;
  user: AuthUser | null;
};

const RelatedBooks = async ({ book, user }: RelatedBooksProps) => {
  const [error, result] = await getRelatedBooks(book.id, {
    artistId: book.artistId,
    publisherId: book.publisherId,
    tags: book.tags ?? [],
  });

  if (error) {
    return <InfoPage errorMessage={error?.reason} user={user ?? null} />;
  }

  const { books } = result;

  if (!books)
    return (
      <InfoPage errorMessage="No related books found" user={user ?? null} />
    );

  return (
    <div class="flex flex-col gap-4">
      <SectionTitle className="mb-2">You might also like</SectionTitle>
      <GridPanel>
        {books.map((b) => (
          <BookCard book={b} user={user} />
        ))}
      </GridPanel>
    </div>
  );
};

export default RelatedBooks;
