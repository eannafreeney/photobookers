import BooksGrid from "./BooksGrid";
import { getBooksByCreatorId } from "../../dashboard/admin/creators/services";
import { Creator } from "../../../db/schema";
import { AuthUser } from "../../../../types";
import SectionTitle from "../../../components/app/SectionTitle";
import ViewAllLink from "./ViewAllLink";

type Props = {
  isMobile?: boolean;
  bookSlug: string;
  currentPage: number;
  creator: Creator | null;
  currentPath: string;
  user: AuthUser | null;
};

const BookGridWrapper = async ({
  isMobile,
  creator,
  bookSlug,
  currentPage,
  currentPath,
  user,
}: Props) => {
  if (!creator) return <></>;

  const [booksError, booksData] = await getBooksByCreatorId(
    creator.id,
    currentPage,
  );

  if (booksError || !booksData) return <></>;

  const result = {
    ...booksData,
    books: booksData.books.filter((b) => b.slug !== bookSlug),
  };

  if (result.books.length === 0) return <></>;

  return (
    <>
      <SectionTitle>Other Books by {creator?.displayName}</SectionTitle>
      <ViewAllLink href={`/creators/${creator?.slug}`} />
      <BooksGrid
        user={user}
        currentPath={currentPath}
        result={result}
        isMobile={isMobile}
      />
    </>
  );
};

export default BookGridWrapper;
