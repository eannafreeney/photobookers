import { AuthUser } from "../../../../types";
import { getLatestBooks } from "../services";
import BooksGrid from "../components/BooksGrid";

type Props = {
  user: AuthUser;
  currentPage: number;
  currentPath: string;
};

const LatestBooksFragment = async ({
  user,
  currentPage,
  currentPath,
}: Props) => {
  const result = await getLatestBooks(currentPage);

  if (!result?.books || result?.books.length === 0) return <></>;

  return (
    <div id="latest-books-fragment">
      <BooksGrid
        title="Latest Books"
        user={user}
        currentPath={currentPath}
        result={result}
        isFullWidth
      />
    </div>
  );
};
export default LatestBooksFragment;
