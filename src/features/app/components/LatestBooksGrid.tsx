import { AuthUser } from "../../../../types";
import { getLatestBooks } from "../services";
import BooksGrid from "./BooksGrid";

type Props = {
  currentPath: string;
  currentPage: number;
  user: AuthUser | null;
  sortBy: "newest" | "oldest" | "title_asc" | "title_desc";
};

const LatestBooksGrid = async ({
  currentPath,
  currentPage,
  user,
  sortBy,
}: Props) => {
  const result = await getLatestBooks(currentPage, 10);

  if (!result?.books) {
    return <div>No featured books found</div>;
  }

  return (
    <BooksGrid
      user={user}
      currentPath={currentPath}
      sortBy={sortBy}
      result={result}
    />
  );
};

export default LatestBooksGrid;
