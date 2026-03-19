import { AuthUser } from "../../../../types";
import { getLatestBooks } from "../services";
import BooksGrid from "../components/BooksGrid";
import { isErr } from "../../../lib/result";

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
  const [error, result] = await getLatestBooks(currentPage);

  if (error) return <></>;

  return (
    <div id="latest-books-fragment">
      <BooksGrid
        title="Latest Books"
        user={user}
        currentPath={currentPath}
        result={result}
      />
    </div>
  );
};
export default LatestBooksFragment;
