import { AuthUser } from "../../../../types";
import { getLatestBooks } from "../services";
import BooksGrid from "../components/BooksGrid";

type Props = {
  user: AuthUser;
  currentPage: number;
  sortBy: "newest" | "oldest" | "title_asc" | "title_desc";
  currentPath: string;
};

const LatestBooksFragment = async ({
  user,
  currentPage,
  sortBy,
  currentPath,
}: Props) => {
  const result = await getLatestBooks(currentPage, sortBy);

  return (
    <div id="latest-books-fragment">
      <BooksGrid
        title="New & Notable"
        user={user}
        currentPath={currentPath}
        sortBy={sortBy}
        result={result}
        showSortDropdown={false}
        isFullWidth
      />
    </div>
  );
};
export default LatestBooksFragment;
