import { AuthUser } from "../../../../types";
import { getFilteredBooks } from "../services";
import BookFilters from "./BookFilters";
import BooksGrid from "./BooksGrid";

type Props = {
  user: AuthUser | null;
  tag: string | null;
  q: string | null;
  currentPath: string;
  result: NonNullable<Awaited<ReturnType<typeof getFilteredBooks>>[1]>;
  isFiltered: boolean;
};

const BooksGridWithFilters = ({
  user,
  tag,
  q,
  currentPath,
  result,
  isFiltered,
}: Props) => (
  <>
    <BookFilters activeTag={tag} q={q} />
    <BooksGrid
      isInfiniteScroll
      user={user}
      currentPath={currentPath}
      result={result}
      noResultsMessage={isFiltered ? "No books match your filters." : undefined}
    />
  </>
);

export default BooksGridWithFilters;
