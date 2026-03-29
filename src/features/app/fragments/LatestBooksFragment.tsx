import { AuthUser } from "../../../../types";
import { getLatestBooks } from "../services";
import BooksGrid from "../components/BooksGrid";
import { isErr } from "../../../lib/result";
import Button from "../../../components/app/Button";

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
        isPaginated={false}
      />
      <div class="flex justify-center mt-8">
        <a href="/books">
          <Button variant="solid" color="primary" width="xl">
            View All Books →
          </Button>
        </a>
      </div>
    </div>
  );
};
export default LatestBooksFragment;
